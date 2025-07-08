import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import Login from '@/views/Login.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import JobList from '@/views/JobList.vue'
import BusinessLogic from '@/views/BusinessLogic.vue'
import Logs from '@/views/Logs.vue'
import ForgotPassword from '@/views/ForgotPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } 
    },
    {
      path: '/joblist',
      name: 'joblist',
      component: JobList,
      meta: { requiresAuth: true, permission: 'view_jobs' } 
    },
    {
      path: '/business-logic',
      name: 'business-logic',
      component: BusinessLogic,
      meta: { requiresAuth: true, permission: 'view_logic' }
    },
    {
      path: '/logs',
      name: 'logs',
      component: Logs,
      meta: { requiresAuth: true, permission: 'view_logs' }
    },
    {
      path: '/resetpassword',
      name: 'resetpassword',
      component: ForgotPassword
    },
    {
      path: '/forgotpassword',
      name: 'forgotpassword',
      component: ResetPassword
    }
    ,
    {
      path: '/updatepassword',
      name: 'updatepassword',
      component: UpdatePassword
    }
  ]
})


import { useUserStore } from '@/stores/user'
import UpdatePassword from '@/views/UpdatePassword.vue'

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = !!localStorage.getItem('data')
  const publicPages = ['/', '/signup', '/resetpassword', '/passwordreset', '/acceptinvite']

  // Allow access to public pages
  if (!isAuthenticated && !publicPages.includes(to.path)) {
    return next('/')
  }

  // If route requires auth but user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/')
  }

  // If route requires a specific permission
  if (to.meta.permission) {
    const requiredPermission = to.meta.permission

    // If userStore is not yet populated from localStorage
    if (userStore.permissions.length === 0) {
      const savedPermissions = localStorage.getItem('permissions')
      if (savedPermissions) {
        userStore.permissions = JSON.parse(savedPermissions)
      }
    }

    if (!userStore.hasPermission(requiredPermission)) {
      return next('/dashboard') 
    }
  }

  next()
})



export default router
