<script setup lang="ts">

import { computed, ref } from 'vue';

import ErrorBlock from '../UI/errors/ErrorBlock.vue';
import Input from '../UI/base/Input.vue';
import Btn from '../UI/base/Btn.vue';
import Code from '../UI/base/Code.vue';

const login = ref('');
const password = ref('');
const code = ref('');

const isWaitingCode = ref(false);

const showErrorStub = ref(false); 

const isDisabled = computed(() => {
    if (isWaitingCode.value) {
        return code.value.length < 4
    } else {
        return login.value.trim().length === 0 || password.value.length === 0;
    }
})

const handleSubmit = () => {
    isWaitingCode.value = true;
}

</script>

<template>
    <div class="container">
        <p class="title">Страница входа для сотрудника</p>
        <div class="login-form">
            <Input title="Логин" v-model="login"/>
            <Input title="Пароль" v-model="password" type="password"/>

            <Transition name="slide-fade">
                <ErrorBlock v-if="showErrorStub" error="Error message"/>
            </Transition>

            <Transition name="slide-fade">
                <Code 
                    v-if="isWaitingCode" 
                    title="Код для подтверждения входа был отправлен на вашу почту" 
                    v-model="code" 
                    :time="60"
                />
            </Transition>

            <Btn 
                :class="{
                    'employee-btn': true,
                    'employee-btn_large-top-maring': isWaitingCode ? false : true,
                }"
                :disabled="isDisabled"
                @click="handleSubmit"
                >
                    {{ isWaitingCode ? 'Войти' : 'Продолжить' }}
                </Btn>
        </div>
    </div>
</template>

<style scoped>

.container {
    width: 619px;
    margin: 90px auto;
}

.employee-btn {
    margin: 22px auto 0;
}

.employee-btn_large-top-maring {
    margin: 40px auto 0;
}

.slide-fade-enter-active {
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.slide-fade-leave-active {
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

</style>