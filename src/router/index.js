import { createRouter, createWebHistory } from 'vue-router'
import StartPage from '../views/StartPage.vue'
import MainPage from '../views/MainPage.vue'
import GoogleCallback from '../views/GoogleCallback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: StartPage },
    { path: '/main', component: MainPage, meta: { requiresAuth: true } },
    { path: '/auth/google/callback', component: GoogleCallback }

  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/');
  }
  else if (to.path === '/' && isAuthenticated) {
    next('/main');
  }
  else {
    next();
  }
})

export default router