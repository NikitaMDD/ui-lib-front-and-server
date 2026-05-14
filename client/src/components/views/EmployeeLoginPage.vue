<script setup lang="ts">
import { computed, ref } from 'vue';

import { post } from "../../utils/requests/post.ts";
import type { 
    LoginRequest, 
    LoginResponse, 
    VerifyCodeRequest, 
    VerifyCodeResponse,
} from "../../types/login/types.ts";

import ErrorBlock from '../UI/errors/ErrorBlock.vue';
import Input from '../UI/base/Input.vue';
import Btn from '../UI/base/Btn.vue';
import Code from '../UI/base/Code.vue';

const login = ref('');
const password = ref('');
const code = ref('');

const isWaitingCode = ref(false);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

const isDisabled = computed(() => {
    if (isLoading.value) return true;
    
    if (isWaitingCode.value) {
        return code.value.length < 4;
    }
    return login.value.trim().length === 0 || password.value.length === 0;
});

const showError = computed(() => !!errorMessage.value);

const handleSubmit = async () => {
    errorMessage.value = null;
    isLoading.value = true;

    try {
        if (!isWaitingCode.value) {
            const response = await post<LoginResponse>('login', {
                login: login.value.trim(),
                password: password.value
            } as LoginRequest);

            isWaitingCode.value = true;

            console.log('response when waitingCode is false', response)
            
        } else {
            const response = await post<VerifyCodeResponse>('login/verify', {
                email: login.value.trim(),
                code: code.value
            } as VerifyCodeRequest);

            if (response) {
                localStorage.setItem('authToken', response.token);
            }
        }
    } catch (e: any) {
        errorMessage.value = e.message || 'Произошла ошибка. Попробуйте позже';
        
        if (isWaitingCode.value && e.status === 400) {
            code.value = '';
        }
    } finally {
        isLoading.value = false;
    }
};

const handleResendCode = async () => {
    errorMessage.value = null;
    isLoading.value = true;
    
    try {
        await post<LoginResponse>('login', {
            login: login.value.trim(),
            password: password.value
        } as LoginRequest);
    } catch (e: any) {
        errorMessage.value = e.message || 'Не удалось отправить код повторно';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="container">
        <p class="title">Страница входа для сотрудника</p>
        <div class="login-form">
            <Input title="Логин" v-model="login" :disabled="isWaitingCode || isLoading"/>
            <Input title="Пароль" v-model="password" type="password" :disabled="isWaitingCode || isLoading"/>

            <Transition name="slide-fade">
                <ErrorBlock v-if="showError" :error="errorMessage || ''"/>
            </Transition>

            <Transition name="slide-fade">
                <Code 
                    v-if="isWaitingCode" 
                    title="Код для подтверждения входа был отправлен на вашу почту" 
                    v-model="code" 
                    :time="60"
                    @resend="handleResendCode"
                />
            </Transition>

            <Btn 
                :class="{
                    'employee-btn': true,
                    'employee-btn_large-top-maring': !isWaitingCode,
                    'employee-btn_loading': isLoading,
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
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}
</style>