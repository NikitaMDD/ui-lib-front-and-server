<script setup lang="ts">
import Input from './Input.vue';
import { nextTick, watch, computed, onMounted, onUnmounted, ref } from 'vue';

interface CodeProps {
    tittle?: string;
    modelValue: string;
    time: number;
}

const props = defineProps<CodeProps>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const digits = ref<string[]>(['', '', '', '']);

const syncFromParent = (value: string) => {
    const onlyDigits = value.replace(/\D/g, '').slice(0, 4);
    digits.value = Array.from({ length: 4 }, (_, i) => onlyDigits[i] ?? '');
}

watch(
    () => props.modelValue,
    (v: string) => syncFromParent(v ?? ''),
    { immediate: true },
);

const emitJoined = () => {
    emit('update:modelValue', digits.value.join(''));
}

const timeLeft = ref(props.time);

let timerId: ReturnType<typeof setInterval> | null = null;

const timeLeftFormatted = computed(() => {
    const m = Math.floor(Math.max(0, timeLeft.value) / 60);
    const s = Math.max(0, timeLeft.value) % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const startTimer = () => {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }

    if (timeLeft.value <= 0) {
        timeLeft.value = props.time;
    }

    timerId = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
        }
    }, 1000);
};

const inputRefs = ref<(InstanceType<typeof Input> | null)[]>([]);

const setInputRef = (el: InstanceType<typeof Input> | null, i: number) => {
    inputRefs.value[i] = el;
};

const focusCell = (i: number) => {
    const comp = inputRefs.value[i];
    const root = comp?.$el as HTMLElement | undefined;
    const native = root?.querySelector('input') as HTMLInputElement | null;
    native?.focus();
    native?.select?.();
}

const onCellUpdate = async (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    digits.value[index] = digit;
    emitJoined();

    if (digit && index < digits.value.length - 1) {
        await nextTick();
        focusCell(index + 1);
    }
}

function onCellKeydown(index: number, e: KeyboardEvent) {
    if (e.key !== 'Backspace') return;
    if (!digits.value[index] && index > 0) {
        e.preventDefault();
        focusCell(index - 1);
    }
}

onMounted(() => {
    startTimer();
});

onUnmounted(() => {
    if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
    }
});

</script>

<template>
    <p class="tittle">{{ props.tittle }}</p>
    <div class="code">
        <Input 
            v-for="(_, index) in digits"
            :key="index"
            :ref="(el) => setInputRef(el as InstanceType<typeof Input> | null, index)"
            class="code__inputs"
            :modelValue="digits[index]"
            mask="numeric"
            :maxlength="1"
            @update:modelValue="(v) => onCellUpdate(index, v)"
            @keydown="(e) => onCellKeydown(index, e)"
        />
    </div>
    <div class="code__timer" v-if="timeLeft > 0">Отправить код можно через {{ timeLeftFormatted }}</div>
    <div class="code__resend" v-else @click="startTimer">Отправить код повторно</div>
</template>

<style scoped>

.tittle {
    font-size: 14px;
    font-weight: 400;
    line-height: 33px;
    color: rgba(51, 54, 63, 1);
    text-align: center;
    margin: 0 0 11px;
}

.code {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 197px;
    width: 100%;
    margin: 0 auto;
}

.code__inputs:deep(.field__input) {
    width: 43px;
    height: 55px;
    box-sizing: border-box;
    padding: 0 14px;
    color: #2B3033;
    font-size: 30px;
}

.code__inputs:deep(.field__label) {
    display: none;
}

.code__timer {
    font-size: 16px;
    line-height: 33px;
    color: #33363F;
    text-align: center;
}

.code__resend {
    color: #1480C0;
    line-height: 33px;
    font-weight: 400;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
}

</style>