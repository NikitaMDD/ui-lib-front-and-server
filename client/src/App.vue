<script setup lang="ts">

import {computed, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Btn from "./components/UI/Btn.vue";
import BackArrow from "./assets/arrow-btn.svg"

const route = useRoute();
const router = useRouter();

const rootPaths = ['/',]

const showBackButton = computed(() => {
  return !rootPaths.includes(route.path)
})

const showMainContent = computed(() => {
  return route.path !== '/'
})

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  console.log(showMainContent);
})

</script>

<template>
  <nav style="padding: 1rem; background: #f5f5f5; display: flex; align-items: center; gap: 1rem;">

    <Btn
        v-if="showBackButton"
        @click="goBack"
        :style="'width: 39px; height: 39px; padding: 0; border-radius: 4px;'"
    >
      <img :src="BackArrow" alt="">
    </Btn>

    <template v-else>
      <router-link to="/pets">Сервис питомцы</router-link> |
      <router-link to="/calendar">Сервис календарь вредных привычек</router-link>
    </template>
  </nav>

  <router-view v-if="showMainContent"/>

</template>
