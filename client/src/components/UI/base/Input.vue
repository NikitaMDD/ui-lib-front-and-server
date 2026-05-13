<script setup lang="ts">

import eyeClosed from '../../../assets/eyeClosed.svg';
import { ref, nextTick } from 'vue';

interface InputProps {
  title?: string;
  modelValue: string;
  className?: string;
  // style?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  mark?: 'red' | 'blue' | 'yellow';
  mask?: 'date' | 'phone' | 'numeric' | RegExp | ((value: string) => string);
  maxlength?: number;
  type?: 'text' | 'password' | 'email' | 'tel' | 'number';
}

const props = defineProps<InputProps>();
const inputType = ref<string | undefined>(props.type);
const inputRef = ref<HTMLInputElement>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'keydown': [event: KeyboardEvent]
}>();

const handleInput = (event: Event) => {
  if ((event as any)._fromMask) {
    console.log('[Input] skipped masked event');
    return;
  }
  const target = event.target as HTMLInputElement;
  console.log('[Input] emitting:', target.value);
  emit('update:modelValue', target.value);
};

const togglePasswordVisibility = () => {
  inputType.value = inputType.value === 'password' ? 'text' : 'password';
  nextTick(() => inputRef.value?.focus());
}

</script>

<template>
  <div class="field">
    <label
      class="field__label"
      :class="{
        'field__label--required': props.error,
      }"
      :for="`id_${props.title}`"
    >
      <span
        v-if="props.mark"
        :class="
         ['field__label-mark', `field__label-mark--${props.mark}`]
        "
      ></span>
      {{props.title}}
    </label>
    <div class="field__container">
      <input
        ref="inputRef"
        class="field__input"
        :class="{
          'field__input--required': props.error,
        }"
        :id="`id_${props.title}`"
        :value="props.modelValue"
        @input="handleInput"
        v-mask="props.mask"
        :maxlength="props.maxlength"
        :type="inputType"
        @keydown="$emit('keydown', $event)"
      />
      <img v-if="props.type === 'password'" class="field__eye-icon" :src="eyeClosed" alt="" @click="togglePasswordVisibility">
    </div>
    <div v-if="props.error" class="field__error-message">
      {{ props.error }}
    </div>
  </div>
</template>

<style scoped>

  .field__container {
    position: relative;
    max-width: 100%;
  }

  .field__input {
    width: 100%;
    border-radius: 8px;
    border: 1px solid #d6d7d8;
    background-color: #eaeaeb;
    padding: 8.5px 13px 8.5px;
    color: #2B3033;
    font-size: 16px;
    line-height: 20px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.3s ease-in-out;
    box-sizing: border-box;
  }

  .field__input:focus {
    border: 1px solid #EFFE7D;
  }

  .field__input--required {
    border: 1px solid rgba(255, 59, 48, 1);
    border-radius: 8px;
    background-color: rgba(255, 225, 225, 1);
  }

  .field__error-message {
    color: #FF3B30;
    font-size: 10px;
    font-weight: 400;
    line-height: 18px;
  }

  .field__label-mark {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    margin: 0 11px 0 0;
  }

  .field__label-mark--red {
    background-color: rgba(255, 0, 0, 1);
  }

  .field__label-mark--yellow {
    background-color: rgba(239, 254, 125, 1);
  }

  .field__label-mark--blue {
    background-color: rgba(0, 122, 255, 1);
  }

  .field__eye-icon {
    position: absolute;
    top: 40%;
    right: 13px;
    cursor: pointer;
  }

</style>