import { createRouter, createWebHistory } from 'vue-router'

const MainView = () => import('../App.vue')
const PetsView = () => import('../components/views/Pets.vue')
const CalendarView = () => import('../components/views/Calendar.vue')

const routes = [
    { path: '/', name: 'Main', component: MainView },
    { path: '/pets', name: 'Pets', component: PetsView },
    { path: '/calendar', name: 'Calendar', component: CalendarView },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router