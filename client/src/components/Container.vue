<script setup lang="ts">

import Btn from "./UI/Btn.vue";
import Table from "./UI/Table.vue";
import Input from "./UI/Input.vue";
import Dropdown from "./UI/Dropdown.vue";
import ModalWindow from "./UI/ModalWindow.vue";
import FileLoader from "./UI/FileLoader.vue";

import {computed, onMounted, reactive, ref} from "vue";
import type {FileWithMeta, FormFields, Pet, PetFormData} from "../types/pets/types.ts";
import { get } from "../utils/requests/get";
import { post } from "../utils/requests/post";
import { put } from "../utils/requests/put";
import { deleteRequest } from "../utils/requests/delete";

const isModalOpen = ref(false);
const currentEditItem = ref<Pet | null>(null);

const formData = reactive<PetFormData>({
  name: '',
  type: '',
  dateOfBirth: '',
  presenceOfAStamp: '',
  vaccination: '',
  treatmentForEctoparasites: '',
  treatmentForHelminths: '',
  sterilization: '',
  files: [],
});

const formErrors = reactive<Record<string, string>>({});

// Валидация формы
const validateForm = (): boolean => {
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  let isValid = true;

  formFields.value.forEach(field => {
    if (field.required) {
      const value = formData[field.key];
      if (field.type === 'fileLoader') {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          formErrors[field.key] = 'Пожалуйста, прикрепите файл';
          isValid = false;
        }
      } else if (!value || (typeof value === 'string' && value.trim() === '')) {
        formErrors[field.key] = 'Пожалуйста, заполните поле';
        isValid = false;
      }
    }
  });
  return isValid;
};

const clearError = (key: string) => {
  if (formErrors[key]) delete formErrors[key];
};

// Поля формы
const formFields = ref<FormFields[]>([
  { label: 'Кличка', key: 'name', type: 'input', placeholder: '', required: true },
  {
    label: 'Вид', key: 'type', type: 'dropdown',
    options: ['Собака', 'Кот', 'Птица'], placeholder: '', required: true,
  },
  { label: 'Дата рождения', key: 'dateOfBirth', type: 'date', placeholder: '', required: true, mask: 'date' },
  {
    label: 'Наличие клейма', key: 'presenceOfAStamp', type: 'dropdown',
    options: ['да', 'нет'], placeholder: '', required: true,
  },
  {
    label: 'Вакцинация', key: 'vaccination', type: 'dropdown',
    options: ['да', 'нет'], placeholder: '', required: true,
  },
  {
    label: 'Обработка от эктопаразитов', key: 'treatmentForEctoparasites', type: 'dropdown',
    options: ['да', 'нет'], placeholder: '', required: true,
  },
  {
    label: 'Обработка от гельминтов', key: 'treatmentForHelminths', type: 'dropdown',
    options: ['да', 'нет'], placeholder: '', required: true,
  },
  {
    label: 'Стерилизация', key: 'sterilization', type: 'dropdown',
    options: ['да', 'нет'], placeholder: '', required: true,
  },
  { label: 'Добавьте документы', key: 'files', type: 'fileLoader', placeholder: '', required: true },
]);

const pets = ref<Pet[]>([]);

// Преобразование данных формы на выходе объект для отправки на бэк
const preparePayload = (formData: PetFormData) => ({
  name: formData.name,
  type: formData.type,
  dateOfBirth: new Date(formData.dateOfBirth),
  presenceOfAStamp: formData.presenceOfAStamp === 'да',
  vaccination: formData.vaccination === 'да',
  treatmentForEctoparasites: formData.treatmentForEctoparasites === 'да',
  treatmentForHelminths: formData.treatmentForHelminths === 'да',
  sterilization: formData.sterilization === 'да',
  files: formData.files.map(f => ({
    url: '',
    fileName: f.file.name,
    fileSize: f.file.size,
    mimeType: f.file.type,
    uploadedAt: new Date(),
  })),
});

// Открытие модального окна: создание
const openCreateModal = () => {
  currentEditItem.value = null;
  Object.assign(formData, {
    name: '', type: '', dateOfBirth: '', presenceOfAStamp: '',
    vaccination: '', treatmentForEctoparasites: '', treatmentForHelminths: '',
    sterilization: '', files: [],
  });
  isModalOpen.value = true;
};

// Открытие модального окна: редактирование
const openEditModal = (item: Pet) => {
  currentEditItem.value = item;
  const existingFiles: FileWithMeta[] = item.files?.map((f, index) => ({
    id: `existing-${index}`,
    date: new Date(),
    customName: f instanceof File ? f.name : 'Документ',
    file: f instanceof File ? f : new File([], 'placeholder'),
  })) || [];

  Object.assign(formData, {
    name: item.name,
    type: item.type,
    dateOfBirth: item.dateOfBirth,
    presenceOfAStamp: item.presenceOfAStamp ? 'да' : 'нет',
    vaccination: item.vaccination ? 'да' : 'нет',
    treatmentForEctoparasites: item.treatmentForEctoparasites ? 'да' : 'нет',
    treatmentForHelminths: item.treatmentForHelminths ? 'да' : 'нет',
    sterilization: item.sterilization ? 'да' : 'нет',
    files: existingFiles,
  });
  isModalOpen.value = true;
};

// Сохранение: создание или обновление
const saveData = async () => {
  if (!validateForm()) return;

  try {
    const payload = preparePayload(formData);

    if (currentEditItem.value) {
      const updated = await put<Pet>(`api/pet/${currentEditItem.value._id}`, payload);
      if (updated) {
        const idx = pets.value.findIndex(p => p._id === updated._id);
        if (idx !== -1) pets.value[idx] = updated;
      }
    } else {
      const created = await post<Pet>('api/pet', payload);
      if (created) pets.value.push(created);
    }
    isModalOpen.value = false;
  } catch (e) {
    console.error('Save failed:', e);
  }
};

// Удаление
const handleDelete = async () => {
  if (!currentEditItem.value?._id) return;

  try {
    const deleted = await deleteRequest<Pet>(`api/pet/${currentEditItem.value._id}`);
    if (deleted) {
      pets.value = pets.value.filter(p => p._id !== deleted._id);
      isModalOpen.value = false;
    }
  } catch (e) {
    console.error('Delete failed:', e);
  }
};

// Загрузка списка питомцев
const loadPets = async () => {
  const data = await get<Pet[]>('api/pets');
  if (data) pets.value = data;
};

const modalTitle = computed(() =>
    currentEditItem.value ? 'Редактирование данных о питомце' : 'Добавление питомца'
);

const btnText = computed(() =>
    currentEditItem.value ? 'Сохранить' : 'Добавить'
);

onMounted(() => {
  loadPets();
});

</script>

<template>
  <Table :items="pets" @click="openEditModal"/>

  <ModalWindow :title="modalTitle" v-model="isModalOpen">
    <div v-for="field in formFields" :key="field.key">
      <Input
          v-if="field.type === 'input'"
          :title="field.label"
          :placeholder="field.placeholder"
          :modelValue="formData[field.key]"
          :required="field.required"
          :error="formErrors[field.key]"
          @update:modelValue="val => { formData[field.key] = val; clearError(field.key); }"
          style="margin-bottom: 24px"
      />

      <Input
          v-if="field.type === 'date'"
          :title="field.label"
          :placeholder="field.placeholder"
          :modelValue="formData[field.key]"
          :required="field.required"
          :error="formErrors[field.key]"
          @update:modelValue="val => { formData[field.key] = val; clearError(field.key); }"
          style="margin-bottom: 24px"
          :mask="field.mask"
      />

      <Dropdown
          v-if="field.type === 'dropdown'"
          :title="field.label"
          :placeholder="field.placeholder"
          :items="field.options"
          :modelValue="formData[field.key]"
          :required="field.required"
          :error="formErrors[field.key]"
          @update:modelValue="val => { formData[field.key] = val; clearError(field.key); }"
          style="margin-bottom: 24px"
      />

      <FileLoader
          v-if="field.type === 'fileLoader'"
          :title="field.label"
          :fileArr="formData.files"
          :required="field.required"
          :error="formErrors[field.key]"
          @change="val => { formData.files = val; clearError(field.key); }"
          style="margin-bottom: 24px"
      />
    </div>

    <Btn @click="saveData" :style="'margin: 38px auto 0;'">{{ btnText }}</Btn>

    <div v-if="currentEditItem" class="remove-btn" @click="handleDelete">
      Удалить запись
    </div>
  </ModalWindow>

  <Btn :disabled="false" :style="'margin: 20px 0 0;'" @click="openCreateModal">Добавить питомца</Btn>
</template>

<style scoped>
</style>