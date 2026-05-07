<script setup lang="ts">
import Input from "./UI/Input.vue";
import ModalWindow from "./UI/ModalWindow.vue";
import Btn from "./UI/Btn.vue";
import CalendarGrid from "./UI/CalendarGrid.vue";

import { computed, reactive, ref, watch } from "vue";
import { post } from "../utils/requests/post";
import { get } from "../utils/requests/get";
import type { FormFields, CalendarEntry, CalendarFormData, CalendarGridCell } from "../types/calendar/types.ts";

import {
  apiDateToCalendarKey,
  formatCalendarMonthParam,
  formatLocalDateKey,
} from "../types/calendar/types.ts";

const calendarData = ref<Record<string, CalendarEntry>>({});

const currentMonth = ref(new Date());
const calendarDays = ref<CalendarGridCell[]>([]);

const monthTitle = computed(() => {
  const raw = currentMonth.value.toLocaleDateString('ru-RU', {month: 'long', year: 'numeric'});
  return raw.charAt(0).toUpperCase() + raw.slice(1);
});

const daysOfWeek = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];

const generateMonthDays = (date: Date): CalendarGridCell[] => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  let startDayOfWeek = firstDay.getDay() || 7;
  startDayOfWeek -= 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: CalendarGridCell[] = [];

  for (let i = startDayOfWeek; i > 0; i--) {
    days.push({
      day: prevMonthDays - i + 1,
      inCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, inCurrentMonth: true });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

const prevMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
};

const isModalOpen = ref(false);
const selectedDate = ref<Date | null>(null);

const choosenDay = computed(() =>
    selectedDate.value
        ? selectedDate.value.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
        : ''
);

const formData = reactive<CalendarFormData>({
  alcohol: '',
  cigarettes: '',
  sugar: '',
});

const formErrors = reactive<Record<string, string>>({});

const formFields = ref<FormFields[]>([
  {
    label: 'Сегодня употреблено алкоголя (мл.)',
    key: "alcohol",
    required: true,
    error: 'Пожалуйста, введите значение',
    mask: 'numeric',
    mark: 'red'
  },
  {
    label: 'Сегодня употреблено сигарет (шт.)',
    key: "cigarettes",
    required: true,
    error: 'Пожалуйста, введите значение',
    mask: 'numeric',
    mark: 'blue'
  },
  {
    label: 'Сегодня употреблено сахара (г.)',
    key: "sugar",
    required: true,
    error: 'Пожалуйста, введите значение',
    mask: 'numeric',
    mark: 'yellow'
  },
]);

const validateForm = (): boolean => {
  Object.keys(formErrors).forEach(key => delete formErrors[key]);
  let isValid = true;

  formFields.value.forEach(field => {
    if (field.required) {
      const value = formData[field.key];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        formErrors[field.key] = field.error || 'Пожалуйста, заполните поле';
        isValid = false;
      }
    }
  });
  return isValid;
};

const clearError = (key: string) => {
  if (formErrors[key]) delete formErrors[key];
};

const openDayModal = (day: number) => {
  selectedDate.value = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth(),
      day
  );

  const key = formatLocalDateKey(selectedDate.value);
  const existing = calendarData.value[key];

  Object.keys(formErrors).forEach(errKey => delete formErrors[errKey]);

  if (existing) {
    Object.assign(formData, {
      alcohol: String(existing.alcohol),
      cigarettes: String(existing.cigarettes),
      sugar: String(existing.sugar),
    });
  } else {
    Object.assign(formData, {alcohol: '', cigarettes: '', sugar: ''});
  }

  isModalOpen.value = true;
};

const saveData = async () => {
  if (!validateForm() || !selectedDate.value) return;

  try {
    const payload: CalendarEntry = {
      date: formatLocalDateKey(selectedDate.value),
      alcohol: Number(formData.alcohol) || 0,
      cigarettes: Number(formData.cigarettes) || 0,
      sugar: Number(formData.sugar) || 0,
    };

    const saved = await post<CalendarEntry>('api/calendar', payload);
    if (!saved) {
      console.error('Save failed');
      return;
    }

    const dateKey = apiDateToCalendarKey(saved.date);
    calendarData.value = {...calendarData.value, [dateKey]: {...saved, date: typeof saved.date === 'string' ? saved.date : String(saved.date)}};
    isModalOpen.value = false;
  } catch (e) {
    console.error('Save failed:', e);
  }
};

const loadCalendarData = async () => {
  const monthStr = formatCalendarMonthParam(currentMonth.value);
  const entries = await get<CalendarEntry[]>(`api/calendar?month=${monthStr}`);
  const nextMap: Record<string, CalendarEntry> = {};
  if (entries?.length) {
    for (const entry of entries) {
      const dateKey = apiDateToCalendarKey(entry.date);
      if (dateKey) nextMap[dateKey] = entry;
    }
  }
  calendarData.value = nextMap;
};

watch(
    currentMonth,
    async () => {
      calendarDays.value = generateMonthDays(currentMonth.value);
      await loadCalendarData();
    },
    {immediate: true}
);
</script>

<template>
  <div class="calendar-container">
    <p class="title">Трекер вредных привычек уровень «Стандарт»</p>

    <CalendarGrid
        :month-title="monthTitle"
        :week-day-labels="daysOfWeek"
        :calendar-days="calendarDays"
        :calendar-data="calendarData"
        :month-anchor="currentMonth"
        @prev="prevMonth"
        @next="nextMonth"
        @select-day="openDayModal"
    />
  </div>

  <ModalWindow :title="choosenDay" v-model="isModalOpen">
    <div v-for="field in formFields" :key="field.key">
      <Input
          :title="field.label"
          :modelValue="formData[field.key]"
          :required="field.required"
          :error="formErrors[field.key]"
          @update:modelValue="val => { formData[field.key] = val; clearError(field.key); }"
          :mask="field.mask"
          :mark="field.mark"
          style="margin-bottom: 24px"
      />
    </div>

    <Btn @click="saveData" :style="'margin: 40px auto 0;'">
      Сохранить
    </Btn>
  </ModalWindow>
</template>

<style scoped>
.calendar-container {
  width: 768px;
  margin: 47px auto;
  box-sizing: border-box;
}
</style>
