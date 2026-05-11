<script setup lang="ts">

import {computed, onMounted, onUnmounted, ref} from "vue";
import arrow from '@/assets/arrow-dropdown.svg';

interface DropdownProps {
  modelValue?: string | null;
  placeholder?: string;
  items: string[];
  title: string;
  required: boolean;
  error?: string;
}

const props = withDefaults(defineProps<DropdownProps>(), {
  placeholder: 'Выберите элемент',
  modelValue: null,
});

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const selectedText = computed(() => {
  return props.modelValue || props.placeholder;
})

const selectItem = (item: string) => {
  emit('update:modelValue', item);
  isOpen.value = false;
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})
</script>

<template>
  <div class="field">
    <div class="field__label">{{props.title}}</div>
    <div
        ref="dropdownRef"
        :class="
        {
          'dropdown': true,
          'dropdown--active': isOpen,
          'dropdown--fulfilled': !selectedText,
          'dropdown--error': props.error && !isOpen, // <--- Изменено: ошибка скрыта при открытом списке
        }
      "
        @click="toggleDropdown"
    >
      <div class="dropdown__selected-item">
        <div>{{ selectedText }}</div>
        <img
            :class="
            {
              'dropdown__arrow': true,
              'dropdown__arrow--active': isOpen,
            }
          "
            :src="arrow"
            alt=""
        >
      </div>
      <Transition name="dropdown-list">
        <div
            v-if="isOpen"
            class="dropdown__list-container"
        >
          <div
              v-for="(item, index) in props.items"
              :key="index"
              :class="
                {
                  'dropdown__item': true,
                  'dropdown__item--first': index === 0,
                  'dropdown__item--last': index === props.items.length - 1,
                  'dropdown__item--selected': selectedText === props.items[index],
                }
              "
              @click.stop="selectItem(item)"
          >{{item}}</div>
        </div>
      </Transition>
    </div>

    <div v-if="props.error && !isOpen" class="field__error-message">
      {{ props.error }}
    </div>
  </div>
</template>

<style scoped>

.field {
  margin-bottom: 20px;
}

.field__label {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2B3033;
}

.dropdown {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #d6d7d8;
  background-color: #eaeaeb;
  padding: 8.5px 13px 8.5px;
  color: #2B3033;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  position: relative;
  cursor: pointer;
  transition: border-radius 0.3s ease-in-out, border 0.3s ease-in-out;
}

.dropdown--fulfilled {
  padding: 15.5px 13px 15.5px;
}

.dropdown--active {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid #EFFE7D;
  border-bottom: 1px solid #d6d7d8;
}

.dropdown--error {
  border: 1px solid rgba(255, 59, 48, 1);
  background-color: rgba(255, 225, 225, 1);
}

.dropdown__selected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown__arrow {
  display: block;
  transition: transform 0.3s ease-in-out;
}

.dropdown__arrow--active {
  transform: rotate(-180deg);
}

.dropdown__list-container {
  position: absolute;
  width: calc(100% + 2px);
  left: -1px;
  top: 38px;
  z-index: 1;
}

.dropdown__item {
  max-width: 100%;
  border: 1px solid #d6d7d8;
  border-left-color: #EFFE7D;
  border-right-color: #EFFE7D;
  border-top: 0;
  background-color: #eaeaeb;
  padding: 9px 13px 10px;
  transition: background 0.3s ease-in-out;
  cursor: pointer;
}

.dropdown__item:hover {
  background-color: #EFFE7D;
}

.dropdown__item--last {
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  border-bottom-color: #EFFE7D;
}

.dropdown-list-enter-from,
.dropdown-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-list-enter-active,
.dropdown-list-leave-active {
  transition: all 0.3s ease-in-out;
}

.dropdown-list-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.dropdown__item--selected {
  background: #EFFE7D;
}

.field__error-message {
  color: #FF3B30;
  font-size: 10px;
  font-weight: 400;
  line-height: 18px;
}

</style>