<script setup lang="ts">

  import exit from '@/assets/exit.svg'

  interface ModalWindowProps {
    title: string;
    modelValue: boolean;
  }

  const props = withDefaults(defineProps<ModalWindowProps>(), {
    modelValue: false,
  });

  const emit = defineEmits<{
    'update:modelValue': [value: boolean];
  }>();

  const close = () => emit('update:modelValue', false);

</script>

<template>
  <Transition name="modal-anim">
    <div v-if="modelValue" class="modal-container" @click="close">
      <div class="backdrop"></div>
      <div class="modal-window" @click.stop>
        <div class="modal-window__header">
          <div class="modal-window__title">{{ props.title }}</div>
          <img class="modal-window__exit-btn" :src="exit" alt="" @click="close">
        </div>
        <div class="modal-window__main">
          <slot/>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: start;
  overflow-y: auto;
  z-index: 1000;
}

.modal-window {
  max-width: 703px;
  width: 100%;
  box-sizing: border-box;
  background: #FFFFFF;
  border-radius: 8px;
  padding: 51px 42px 40px;
  margin: 38px auto 235px;
  position: relative;
  z-index: 1001;
}

.modal-window__title {
  font-size: 16px;
  font-weight: 600;
}

.modal-window__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 20px;
}

.modal-window__title {
  width: 100%;
  text-align: center;
}

.modal-window__exit-btn {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: block;
}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  pointer-events: none;
}

/* --- АНИМАЦИИ (Vue Transition Classes) --- */

.modal-anim-enter-active,
.modal-anim-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.modal-anim-enter-from,
.modal-anim-leave-to {
  opacity: 0;
}

/* При появлении начинаем с -30px сверху и прозрачности 0 */
.modal-anim-enter-from .modal-window,
.modal-anim-leave-to .modal-window {
  opacity: 0;
  transform: translateY(-30px);
}

/* Активная фаза анимации для окна */
.modal-anim-enter-active .modal-window,
.modal-anim-leave-active .modal-window {
  transition: all 0.3s ease-in-out;
}

/* 4. Анимация для ФОНА (Только прозрачность) */
.modal-anim-enter-from .backdrop,
.modal-anim-leave-to .backdrop {
  opacity: 0;
}

.modal-anim-enter-active .backdrop,
.modal-anim-leave-active .backdrop {
  transition: opacity 0.3s ease-in-out;
}
</style>