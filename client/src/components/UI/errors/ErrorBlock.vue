<script setup lang="ts">

import ErrorIcon from '@/assets/error-icon.svg';

interface ErrorBlockProps {
    error: string;
}

const props = defineProps<ErrorBlockProps>();

</script>

<template>
    <div class="error-block">
        <img :src="ErrorIcon" alt="error-icon">
        <span>{{ props.error }}</span>
    </div>
</template>

<style scoped>
    .error-block {
        background: rgba(255, 225, 225, 1);
        padding: 20px 17px 22px;
        display: flex;
        align-items: center;
        width: 100%;
        border-radius: 8px;
    }
    img {
        margin: 0 9px 0 0;
    }
    span {
        color: #2B3033;
        font-size: 16px;
        font-weight: 600;
    }
</style>