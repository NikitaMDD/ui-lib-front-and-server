<script setup lang="ts">
import { serviceRoutes } from '../../router/routes'
</script>

<template>
    <template v-for="route in serviceRoutes" :key="route.path">
        <router-link :to="route.path">
            {{ route.clientName }}
        </router-link> <span v-if="route !== serviceRoutes[serviceRoutes.length - 1]">|</span>
    </template>
</template>

<style scoped>

</style>