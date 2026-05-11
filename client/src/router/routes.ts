const MainView = () => import('../components/views/HomePage.vue')
const PetsView = () => import('../components/views/Pets.vue')
const CalendarView = () => import('../components/views/Calendar.vue')

export const routes = [
    { path: '/', name: 'Main', clientName: '', component: MainView },
    { path: '/pets', name: 'Pets', clientName: 'Сервис питомцы', component: PetsView },
    { path: '/calendar', name: 'Calendar', clientName: 'Сервис календарь вредных привычек', component: CalendarView },
]

export const serviceRoutes = routes.filter(route => route.path !== '/');