<script setup lang="ts">

import Btn from "../UI/base/Btn.vue";
import Table from "../UI/base/Table.vue";
import Input from "../UI/base/Input.vue";
import Dropdown from "../UI/base/Dropdown.vue";
import ModalWindow from "../UI/base/ModalWindow.vue";
import FileLoader from "../UI/base/FileLoader.vue";

import { computed, onMounted, reactive, ref, watch } from "vue";
import type { FileWithMeta, FormFields, Pet, PetFormData, PetFileApi } from "../../types/pets/types.ts";
import { get } from "../../utils/requests/get.ts";
import { post } from "../../utils/requests/post.ts";
import { put } from "../../utils/requests/put.ts";
import { deleteRequest } from "../../utils/requests/delete.ts";

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

const resetForm = () => {
  Object.assign(formData, {
    name: '', type: '', dateOfBirth: '', presenceOfAStamp: '',
    vaccination: '', treatmentForEctoparasites: '', treatmentForHelminths: '',
    sterilization: '', files: [],
  });
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  currentEditItem.value = null;
};

watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    resetForm();
  }
});

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

const formatISOToRuMask = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}.${mm}.${yyyy}`;
};

const parseRuDateToISO = (value: string): string | null => {
  const dateParts = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!dateParts) return null;

  const [, day, month, year] = dateParts;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
      parsedDate.getUTCFullYear() !== Number(year) ||
      parsedDate.getUTCMonth() !== Number(month) - 1 ||
      parsedDate.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return parsedDate.toISOString();
};

const preparePayload = (formData: PetFormData, dateISO: string) => ({
  name: formData.name,
  type: formData.type,
  dateOfBirth: dateISO,
  presenceOfAStamp: formData.presenceOfAStamp === 'да',
  vaccination: formData.vaccination === 'да',
  treatmentForEctoparasites: formData.treatmentForEctoparasites === 'да',
  treatmentForHelminths: formData.treatmentForHelminths === 'да',
  sterilization: formData.sterilization === 'да',
  files: formData.files.map((f) => {
    if (f.preservedServerFile) {
      const p = f.preservedServerFile;
      return {
        url: p.url ?? '',
        fileName: p.fileName,
        fileSize: p.fileSize,
        mimeType: p.mimeType || 'application/octet-stream',
        uploadedAt: new Date(p.uploadedAt),
      };
    }
    return {
      url: '',
      fileName: f.file.name,
      fileSize: f.file.size,
      mimeType: f.file.type || 'application/octet-stream',
      uploadedAt: new Date(),
    };
  }),
});

const openCreateModal = () => {
  resetForm();
  isModalOpen.value = true;
};

const openEditModal = (item: Pet) => {
  currentEditItem.value = item;
  const rawFiles = item.files ?? [];
  const existingFiles: FileWithMeta[] = rawFiles.map((f, index) => {
    if (f && typeof f === 'object' && !(f instanceof File) && 'fileName' in f) {
      const meta = f as PetFileApi;
      const mime = meta.mimeType || 'application/octet-stream';
      return {
        id: `existing-${index}`,
        date: new Date(meta.uploadedAt ?? Date.now()),
        customName: meta.fileName,
        file: new File([], meta.fileName, { type: mime }),
        preservedServerFile: {
          url: meta.url ?? '',
          fileName: meta.fileName,
          fileSize: meta.fileSize,
          mimeType: mime,
          uploadedAt: meta.uploadedAt ?? new Date().toISOString(),
        },
      };
    }
    if (f instanceof File) {
      return {
        id: `file-${index}`,
        date: new Date(),
        customName: f.name,
        file: f,
      };
    }
    return {
      id: `legacy-${index}`,
      date: new Date(),
      customName: 'Документ',
      file: new File([], 'document', { type: 'application/octet-stream' }),
    };
  });

  Object.assign(formData, {
    name: item.name,
    type: item.type,
    dateOfBirth: formatISOToRuMask(item.dateOfBirth),
    presenceOfAStamp: item.presenceOfAStamp ? 'да' : 'нет',
    vaccination: item.vaccination ? 'да' : 'нет',
    treatmentForEctoparasites: item.treatmentForEctoparasites ? 'да' : 'нет',
    treatmentForHelminths: item.treatmentForHelminths ? 'да' : 'нет',
    sterilization: item.sterilization ? 'да' : 'нет',
    files: existingFiles,
  });
  isModalOpen.value = true;
};

const saveData = async () => {
  if (!validateForm()) return;

  const dateISO = parseRuDateToISO(formData.dateOfBirth);
  if (!dateISO) {
    formErrors.dateOfBirth = 'Введите дату в формате ДД.ММ.ГГГГ';
    return;
  }

  try {
    const payload = preparePayload(formData, dateISO);

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

  <div class="container">
    <p class="title">Список питомцев</p>
    <Table :items="pets" @click="openEditModal"/>

    <Btn :disabled="false" :style="'margin: 20px 0 0;'" @click="openCreateModal">Добавить питомца</Btn>
  </div>

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

</template>

<style scoped>
  .container {
    width: 768px;
    margin: 144px auto;
  }
</style>