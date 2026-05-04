<script setup lang="ts">
import Input from "./UI/Input.vue";
import ModalWindow from "./UI/ModalWindow.vue";
import Btn from "./UI/Btn.vue";
import Arrow from "../assets/arrow-btn.svg";

import { computed, onMounted, reactive, ref } from "vue";
import { post } from "../utils/requests/post";
import type { FormFields, CalendarEntry, CalendarFormData } from "../types/calendar/types.ts";

import SegmentedProgressRing from "./UI/SegmentedProgressRing.vue";
import { MAX_VALUES, formatDateKey } from "../types/calendar/types.ts";

const calendarData = ref<Record<string, CalendarEntry>>({});

const getAlcoholProgress = (entry: CalendarEntry): number => {
  return Math.min((entry.alcohol / MAX_VALUES.alcohol) * 100, 100);
};

const getCigarettesProgress = (entry: CalendarEntry): number => {
  return Math.min((entry.cigarettes / MAX_VALUES.cigarettes) * 100, 100);
};

const getSugarProgress = (entry: CalendarEntry): number => {
  return Math.min((entry.sugar / MAX_VALUES.sugar) * 100, 100);
};

const getDayDateKey = (day: number): string => {
  return formatDateKey(new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth(),
      day
  ));
};

const currentMonth = ref(new Date());
const calendarDays = ref<(number | null)[]>([]);

const monthTitle = computed(() => {
  const raw = currentMonth.value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
});

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const generateMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  let startDayOfWeek = firstDay.getDay() || 7;
  startDayOfWeek -= 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: (number | null)[] = [];

  for (let i = startDayOfWeek; i > 0; i--) {
    days.push(prevMonthDays - i + 1);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  /*
  while (days.length < 42) {
    days.push(null);
  }
  */

  return days;
};

const prevMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentMonth.value = newDate;
  calendarDays.value = generateMonthDays(newDate);
};

const nextMonth = () => {
  const newDate = new Date(currentMonth.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentMonth.value = newDate;
  calendarDays.value = generateMonthDays(newDate);
};

const goToToday = () => {
  currentMonth.value = new Date();
  calendarDays.value = generateMonthDays(currentMonth.value);
};

const isModalOpen = ref(false);
const selectedDate = ref<Date | null>(null);

const choosenDay = computed(() =>
    selectedDate.value
        ? selectedDate.value.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
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

const openDayModal = (day: number | null) => {
  if (!day) return;

  selectedDate.value = new Date(
      currentMonth.value.getFullYear(),
      currentMonth.value.getMonth(),
      day
  );

  Object.assign(formData, { alcohol: '', cigarettes: '', sugar: '' });
  Object.keys(formErrors).forEach(key => delete formErrors[key]);

  isModalOpen.value = true;
};

const saveData = async () => {
  if (!validateForm() || !selectedDate.value) return;

  try {
    const payload: CalendarEntry = {
      date: selectedDate.value.toISOString(),
      alcohol: Number(formData.alcohol) || 0,
      cigarettes: Number(formData.cigarettes) || 0,
      sugar: Number(formData.sugar) || 0,
    };

    await post<CalendarEntry>('api/calendar', payload);

    const dateKey = formatDateKey(selectedDate.value);
    calendarData.value[dateKey] = payload;

    console.log('Сохраняю ключ:', dateKey);
    console.log('calendarData:', calendarData.value);

    isModalOpen.value = false;
  } catch (e) {
    console.error('Save failed:', e);
  }
};

const loadCalendarData = async () => {
  try {
    const response = await fetch('/api/calendar?month=' + currentMonth.value.toISOString().slice(0, 7));
    const entries: CalendarEntry[] = await response.json();

    entries.forEach(entry => {
      const dateKey = formatDateKey(new Date(entry.date));
      calendarData.value[dateKey] = entry;
    });
  } catch (e) {
    console.error('Load failed:', e);
  }
};

onMounted(() => {
  calendarDays.value = generateMonthDays(currentMonth.value);
  loadCalendarData();
});
</script>

<template>
  <div class="calendar">
    <div class="calendar__header">
      <Btn
          class="calendar__nav-btn"
          @click="prevMonth"
      >
        <img :src="Arrow" alt="Назад">
      </Btn>

      <span class="calendar__month-title">
        {{ monthTitle }}
      </span>

      <Btn
          class="calendar__nav-btn"
          @click="nextMonth"
      >
        <img :src="Arrow" alt="Вперёд" class="calendar__arrow-flipped" :style="'margin: 0 auto 1px;'">
      </Btn>
    </div>

    <div class="calendar__main">
      <div class="calendar__week-days">
        <div v-for="day in daysOfWeek" :key="day" class="calendar__day-name">
          {{ day }}
        </div>
      </div>

      <div class="calendar__dates">
        <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="calendar__date-cell"
            :class="{ 'calendar__date-cell--empty': day === null }"
            @click="openDayModal(day)"
        >
          <div class="calendar__date-content">
            <span class="calendar__date-number">{{ day }}</span>

            <SegmentedProgressRing
                v-if="day && calendarData[getDayDateKey(day)]"
                :alcohol-progress="getAlcoholProgress(calendarData[getDayDateKey(day)]!)"
                :cigarettes-progress="getCigarettesProgress(calendarData[getDayDateKey(day)]!)"
                :sugar-progress="getSugarProgress(calendarData[getDayDateKey(day)]!)"
                :size="40"
                :stroke-width="3"
                :duration="0.5"
                class="calendar__progress-ring"
            />
          </div>
        </div>
      </div>
    </div>
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
.calendar {
  padding: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 0 8px;
}

.calendar__nav-btn {
  width: 39px;
  height: 39px;
  padding: 0;
  border-radius: 4px;
}

.calendar__nav-btn img {
  width: 10px;
  height: 10px;
  display: block;
  margin: 0 auto;
}

.calendar__arrow-flipped {
  transform: rotate(-180deg);
}

.calendar__month-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-transform: none;
  user-select: none;
}

/* --- Сетка календаря --- */
.calendar__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar__week-days,
.calendar__dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar__week-days {
  padding: 4px 2px;
}

.calendar__day-name {
  text-align: center;
  font-size: 13px;
  color: #888;
  font-weight: 500;
  line-height: 1;
  padding: 8px 0;
  user-select: none;
}

.calendar__dates {
  padding: 0 2px;
}

/* Ячейка даты — контейнер */
.calendar__date-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  transition: background 0.15s ease;
}

.calendar__date-cell:hover {
  background: #f9fafb;
}

.calendar__date-cell--empty {
  cursor: default;
  pointer-events: none;
}

.calendar__date-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.calendar__date-number {
  position: relative;
  z-index: 2;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  color: #1f2937;
}

.calendar__progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
}

.calendar__date-cell--has-data .calendar__date-number {
  font-weight: 500;
  color: #1f2937;
}

/* Адаптив */
@media (max-width: 480px) {
  .calendar {
    padding: 12px;
  }

  .calendar__date-cell {
    height: 36px;
  }

  .calendar__date-number {
    font-size: 13px;
  }

  .calendar__day-name {
    font-size: 12px;
    padding: 6px 0;
  }

  .calendar__nav-btn {
    width: 36px;
    height: 36px;
  }

  .calendar__month-title {
    font-size: 15px;
  }
}

.calendar__date-cell--today {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}

.calendar__date-cell--today .calendar__date-number {
  color: #2563eb;
  font-weight: 600;
}

.calendar__date-cell--has-data:hover .calendar__progress-ring {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.05);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.calendar__progress-ring {
  opacity: 0.9;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.calendar * {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.calendar__nav-btn:active {
  transform: scale(0.98);
}

@keyframes ringFadeIn {
  to {
    opacity: 1;
  }
}

.calendar__date-cell:hover .calendar__progress-ring {
  transform: translate(-50%, -50%) scale(1.1);
  transition: transform 0.3s ease-in-out;
}

@keyframes ringAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.calendar__progress-ring {
  animation: ringAppear 0.3s ease-in-out forwards;
}
</style>