import './assets/style.css' // <--- ГЛАВНАЯ СТРОЧКА. Вставь её первой.

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.mount('#app')