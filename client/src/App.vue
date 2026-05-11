<script setup lang="ts">

import {computed} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Btn from "./components/UI/base/Btn.vue";
import BackArrow from "./assets/arrow-btn.svg"

const route = useRoute();
const router = useRouter();

const rootPaths = ['/',]

const showBackButton = computed(() => {
  return !rootPaths.includes(route.path)
})

const goBack = () => {
  router.push('/')
}

</script>

<template>
  <nav 
    v-if="showBackButton"
    style="padding: 1rem; background: #f5f5f5; display: flex; align-items: center; gap: 1rem;"
  >

    <Btn
      @click="goBack"
      :style="'width: 39px; height: 39px; padding: 0; border-radius: 4px;'"
    >
      <img :src="BackArrow" alt="">
    </Btn>

  </nav>

  <router-view/>

</template>
