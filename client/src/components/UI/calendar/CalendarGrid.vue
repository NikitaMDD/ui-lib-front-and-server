<script setup lang="ts">
import Btn from "../base/Btn.vue";
import SegmentedProgressRing from "./SegmentedProgressRing.vue";
import type { CalendarEntry, CalendarGridCell } from "../../../types/calendar/types.ts";
import { MAX_VALUES, formatCalendarDayKey } from "../../../types/calendar/types.ts";
import Arrow from "../../assets/arrow-btn.svg";

const props = defineProps<{
  monthTitle: string;
  weekDayLabels: string[];
  calendarDays: CalendarGridCell[];
  calendarData: Record<string, CalendarEntry>;
  monthAnchor: Date;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  selectDay: [day: number];
}>();

const getDayDateKey = (day: number): string => {
  return formatCalendarDayKey(
      props.monthAnchor.getFullYear(),
      props.monthAnchor.getMonth(),
      day
  );
};

const getAlcoholProgress = (entry: CalendarEntry): number =>
    Math.min((entry.alcohol / MAX_VALUES.alcohol) * 100, 100);

const getCigarettesProgress = (entry: CalendarEntry): number =>
    Math.min((entry.cigarettes / MAX_VALUES.cigarettes) * 100, 100);

const getSugarProgress = (entry: CalendarEntry): number =>
    Math.min((entry.sugar / MAX_VALUES.sugar) * 100, 100);

const ringSize = 76;
const ringStrokeWidth = 6;

const handleCellClick = (cell: CalendarGridCell) => {
  if (!cell?.inCurrentMonth) return;
  emit('selectDay', cell.day);
};
</script>

<template>
  <div class="calendar">
    <div class="calendar__header">
      <Btn class="calendar__nav-btn" @click="emit('prev')">
        <img :src="Arrow" alt="Назад">
      </Btn>

      <span class="calendar__month-title">
        {{ monthTitle }}
      </span>

      <Btn class="calendar__nav-btn" @click="emit('next')">
        <img
            :src="Arrow"
            alt="Вперёд"
            class="calendar__arrow-flipped"
            :style="'margin: 0 auto 1px;'"
        >
      </Btn>
    </div>

    <div class="calendar__main">
      <div class="calendar__week-days">
        <div v-for="dayLabel in weekDayLabels" :key="dayLabel" class="calendar__day-name">
          {{ dayLabel }}
        </div>
      </div>

      <div class="calendar__dates">
        <div
            v-for="(cell, index) in calendarDays"
            :key="index"
            class="calendar__date-cell"
            :class="{
              'calendar__date-cell--empty': cell === null,
              'calendar__date-cell--outside': cell && !cell.inCurrentMonth,
            }"
            @click="handleCellClick(cell)"
        >
          <div class="calendar__date-content">
            <span class="calendar__date-number">{{ cell?.day ?? '' }}</span>

            <SegmentedProgressRing
                v-if="cell?.inCurrentMonth && calendarData[getDayDateKey(cell.day)]"
                class="calendar__progress-ring"
                :alcohol-progress="getAlcoholProgress(calendarData[getDayDateKey(cell.day)]!)"
                :cigarettes-progress="getCigarettesProgress(calendarData[getDayDateKey(cell.day)]!)"
                :sugar-progress="getSugarProgress(calendarData[getDayDateKey(cell.day)]!)"
                :size="ringSize"
                :stroke-width="ringStrokeWidth"
                :duration="0.5"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar {
  padding: 16px;
  max-width: 708px;
  margin: 0 auto;
  box-sizing: border-box;
}

.calendar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 33px;
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
  text-transform: none;
  user-select: none;
  font-size: 26px;
  color: rgba(115, 115, 115, 1);
  font-weight: 600;
}

.calendar__main {
  display: flex;
  flex-direction: column;
}

.calendar__week-days,
.calendar__dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar__week-days {
  margin: 0 0 47px;
}

.calendar__day-name {
  text-align: center;
  font-size: 20px;
  color: rgba(115, 115, 115, 1);
  font-weight: 600;
  line-height: 1;
  user-select: none;
}

.calendar__date-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border-radius: 4px;
  transition: background 0.15s ease-in-out;
  margin: 0 0 42px;
}

.calendar__date-cell--empty {
  cursor: default;
  pointer-events: none;
}

.calendar__date-cell--outside {
  cursor: default;
  pointer-events: none;
}

.calendar__date-cell--outside:hover {
  background: transparent;
}

.calendar__date-cell--outside .calendar__date-number {
  color: #aeb3ba;
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
  font-size: 30px;
  font-weight: 400;
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

.calendar__date-cell:hover .calendar__progress-ring {
  transform: translate(-50%, -50%) scale(1.1);
  transition: transform 0.3s ease-in-out;
}

.calendar__progress-ring {
  opacity: 0.95;
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
