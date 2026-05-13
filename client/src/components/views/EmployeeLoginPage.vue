<script setup lang="ts">

import { ref } from 'vue';

import ErrorBlock from '../UI/errors/ErrorBlock.vue';
import Input from '../UI/base/Input.vue';
import Btn from '../UI/base/Btn.vue';
import Code from '../UI/base/Code.vue';

const login = ref('');
const password = ref('');
const code = ref('');

const isWaitingCode = ref(false);

</script>

<template>
    <div class="container">
        <p class="title">Страница входа для сотрудника</p>
        <div class="login-form">
            <Input title="Логин" v-model="login"/>
            <Input title="Пароль" v-model="password" type="password"/>

            <ErrorBlock error="Error message"/>

            <Code tittle="Код для подтверждения входа был отправлен на вашу почту" :modelValue="code" :time="60"/>

            <Btn>{{ isWaitingCode ? 'Войти' : 'Продолжить' }}</Btn>
        </div>
    </div>
</template>

<style scoped>

</style>