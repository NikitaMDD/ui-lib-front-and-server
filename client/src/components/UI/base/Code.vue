<script setup lang="ts">
import Input from './Input.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface CodeProps {
    tittle?: string;
    modelValue: string;
    time: number;
}

const props = defineProps<CodeProps>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
}>();

const firstPart = ref('');
const secondPart = ref('');
const thirdPart = ref('');
const fourthPart = ref('');

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
        <Input class="code__inputs" :modelValue="firstPart" mask="numeric"/>
        <Input class="code__inputs" :modelValue="secondPart" mask="numeric"/>
        <Input class="code__inputs" :modelValue="thirdPart" mask="numeric"/>
        <Input class="code__inputs" :modelValue="fourthPart" mask="numeric"/>
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