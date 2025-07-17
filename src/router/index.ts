import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '@/views/SignUp.vue'
import Login from '@/views/Login.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      name: 'signup',
      component: SignUp
    },
    
  ]
})





export default router
