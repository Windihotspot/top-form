import { createRouter, createWebHistory } from 'vue-router'
import SignUp from '@/views/SignUp.vue'
import LoginView from '@/views/LoginView.vue'
import VerifyEmail from '@/views/VerifyEmail.vue'
import AuthCallback from '@/views/AuthCallback.vue'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import AdminProfile from '@/views/AdminProfile.vue'
import DatabaseView from '@/views/DatabaseView.vue'
import AttendanceView from '@/views/AttendanceView.vue'
import SchoolCalendar from '@/views/SchoolCalendar.vue'
import ExpensesView from '@/views/ExpensesView.vue'
import Onboarding from '@/views/Onboarding.vue'
import ExamsView from '@/views/ExamsView.vue'
import TransportView from '@/views/TransportView.vue'
import RevenueView from '@/views/RevenueView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    // {
    //   path: '/',
    //   name: 'signup',
    //   component: SignUp
    // },
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
    {
      path: '/database',
      name: 'database',
      component: DatabaseView
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: SchoolCalendar
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView
    },
    {
      path: '/exams',
      name: 'exams',
      component: ExamsView
    },
    {
      path: '/transport',
      name: 'transport',
      component: TransportView
    },
    {
      path: '/payments',
      name: 'payments',
      component: RevenueView
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: Onboarding
    },
    
  ]
})

export default router
