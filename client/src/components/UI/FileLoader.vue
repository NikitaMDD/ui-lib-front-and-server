<script setup lang="ts">

import Input from "./Input.vue";
import {ref, watch} from "vue";
import plus from '@/assets/plus.svg';
import fileLogo from '@/assets/file-logo.svg';
import deleteIcon from '@/assets/delete-icon.svg';
import type {FileWithMeta} from "../../types/pets/types.ts";

interface FileLoaderProps {
  title: string;
  fileArr: FileWithMeta[];
  error?: string;
}

const fileNameInput = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);

const props = defineProps<FileLoaderProps>();

const emit = defineEmits<{
  (e: 'change', files: FileWithMeta[]): void
}>();

const localFiles = ref<FileWithMeta[]>([...props.fileArr]);

watch(() => props.fileArr, (newVal) => {
  localFiles.value = [...newVal];
}, {deep: true});

const triggerFileInput = () => {
  fileInputRef.value?.click();
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const rawFile = target.files?.[0] || null;

  console.log(fileNameInput.value);

  if (rawFile) {
    const newFileItem: FileWithMeta = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
      date: new Date(),
      customName: fileNameInput.value || rawFile.name,
      file: rawFile,
    };

    localFiles.value.push(newFileItem);
    emit('change', localFiles.value);

    console.log(localFiles.value);

    target.value = '';
    fileNameInput.value = '';
  }
}

const removeFile = (index: number) => {
  localFiles.value.splice(index, 1);
  emit('change', localFiles.value);
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

</script>

<template>
  <div class="file-loader">
    <div class="file-loader__header">
      <label class="file-loader__label" @click="triggerFileInput">
        {{props.title}} <img class="file-loader__plus" :src="plus" alt=""/>
      </label>
    </div>
    <div class="file-loader__main">
      <Input
        :title="'Название документа'"
        :modelValue="fileNameInput"
        @update:modelValue="val => fileNameInput = val"
      />
      <div class="file-loader__link" @click="triggerFileInput">Выберите файл</div>
      <input
        ref="fileInputRef"
        type="file"
        class="file-loader__input-hidden"
        @change="onFileChange"
      >
      <div class="file-loader__error-message">
        {{ props.error }}
      </div>
    </div>
    <TransitionGroup name="file-list" tag="div" class="file-loader__footer">
      <div class="file-loader__file-item" v-for="(file, index) in localFiles" :key="file.id">
        <div class="file-loader__cont">
          <img class="file-loader__logo" :src="fileLogo" alt="">
          <div>
            <div class="file-loader__time">{{formatDate(file.date)}}</div>
            <div class="file-loader__name">{{file.customName}}</div>
          </div>
        </div>
        <img class="file-loader__delete" @click="removeFile(index)" :src="deleteIcon" alt="">
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>

  .file-loader__header {
    padding: 0 0 17px;
    border-bottom: 1px solid #DFDFE0;
    margin: 0 0 12px;
  }

  .file-loader__label {
    font-size: 16px;
    font-weight: 600;
    color: rgba(43, 48, 51, 1);
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .file-loader__plus {
    margin: 0 0 0 18px;
  }

  .file-loader__link {
    font-size: 14px;
    font-weight: 500;
    text-decoration: underline;
    cursor: pointer;
  }

  .file-loader__input-hidden {
    display: none;
  }

  .file-loader__file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 17px 0 0;
    overflow: hidden;
    transform-origin: center;
  }

  .file-loader__cont {
    display: flex;
    align-items: center;
  }

  .file-loader__logo {
    margin: 0 19px 0 0;
  }

  .file-loader__time {
    font-size: 12px;
    font-weight: 500;
    color: #2B3033;
    opacity: .6;
  }

  .file-loader__name {
    font-size: 16px;
    font-weight: 500;
  }

  .file-loader__delete {
    cursor: pointer;
  }

  /* Анимации */

  .file-list-enter-active {
    transition: opacity 0.3s ease-in-out;
  }

  .file-list-enter-from {
    opacity: 0;
  }

  .file-list-enter-to {
    opacity: 1;
  }

  .file-list-leave-active {
    transition: opacity 0.3s ease-in-out;
    width: 100%;
  }

  .file-list-leave-from {
    opacity: 1;
  }

  .file-list-leave-to {
    opacity: 0;
  }

  .file-list-move {
    transition: transform 0.3s ease-in-out;
  }

  .file-loader__error-message {
    color: #FF3B30;
    font-size: 10px;
    font-weight: 400;
    line-height: 18px;
  }

</style>