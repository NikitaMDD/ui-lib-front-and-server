import { createApp } from 'vue'
import './style.css'
import { vMask } from './directives/mask';
import App from './App.vue'
import router from './router'

const app = createApp(App);
app.directive('mask', vMask);
app.use(router)
app.mount('#app');