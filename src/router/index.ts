import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '@/views/SignUp.vue'
import LoginView from '@/views/LoginView.vue'
import VerifyEmail from '@/views/VerifyEmail.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import AdminProfile from '@/views/AdminProfile.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'signup',
      component: SignUp
    },
    {
      path: '/verifyemail',
      name: 'verifyemail',
      component: VerifyEmail
    },
    {
      path: '/auth/callback',
      name: 'authcallback',
      component: AuthCallback
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/adminprofile',
      name: 'adminprofile',
      component: AdminProfile
    },
    
  ]
})

export default router
