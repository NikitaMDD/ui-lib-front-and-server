<script setup lang="ts">

import arrow from '@/assets/arrow.svg';
import type {Pet} from "../../types/pets/types.ts";

interface TableProps {
  className?: string;
  emptyError?: string;
  items: Pet[];
}

const props = defineProps<TableProps>();

const emit = defineEmits<{
  click: [item: Pet, event: MouseEvent];
}>();

const handleClick = (item: Pet, event: MouseEvent) => {
  emit('click', item, event);
}

</script>

<template>
  <div :class="['table', props.className]" >
    <div
      v-if='props.items.length > 0'
      v-for="(item, index) in props.items"
      :key="index"
      class="table__item"
      :class="{
        'table__item--first': index === 0,
        'table__item--last': index === props.items.length - 1,
      }"
      @click="(event) => handleClick(item, event)"
    >
      <div>{{item.name}}</div>
      <img class="table__image" :src="arrow" alt="arrow">
    </div>
    <div
      class="error-empty"
      v-else
    >{{props.emptyError ?? 'Здесь пока пусто...'}}</div>
  </div>
</template>

<style scoped>
  .table {
    max-width: 768px;
    width: 100%;
    border: 1px solid rgba(199, 199, 199, 1);
    border-radius: 8px;
    background-color: rgba(243, 243, 243, 1);
    padding: 16px 20px;
  }

  .table__item {
    border-bottom: 1px solid #DFDFE0;
    padding-top: 15px;
    padding-bottom: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }

  .table__item--first {
    padding-top: 0;
  }

  .table__item--last {
    border-bottom: none;
    padding-bottom: 0;
  }

  .table__image {
    display: block;
    margin: 0 12px 0 0;
    height: 13px;
  }

  .error-empty {
    text-align: center;
  }

</style>