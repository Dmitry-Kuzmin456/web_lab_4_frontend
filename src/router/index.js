import { createRouter, createWebHistory } from 'vue-router'
import StartPage from '../views/StartPage.vue'
import MainPage from '../views/MainPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: StartPage },
    { path: '/main', component: MainPage, meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('auth_token')) {
    next('/');
  } else {
    next();
  }
})

export default router