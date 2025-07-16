// src/stores/user.ts
import { defineStore } from 'pinia'
import type { User, Role, DashboardStats, LoginResponseData } from './types'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null as User | null,
    dashboardStats: null as DashboardStats | null,
    role: null as Role | null,
    permissions: [] as string[],
    refreshToken: '' as string,
     isReady: false 
  }),
  actions: {
    setUserData(data: LoginResponseData) {
       this.isReady = true 
      console.log('✅ setUserData called')
      console.log('🚀 Raw user data from API:', data)
      this.token = data.token
      this.user = data.user
      this.role = data.user.role
      ;(this.permissions = data.user.role?.permissions || []),
        (this.refreshToken = data.refresh_token), // <- Add this
        localStorage.setItem('refreshToken', data.refresh_token)

      this.dashboardStats = {
        total_accepted_jobs: data.total_accepted_jobs,
        total_rejected_jobs: data.total_rejected_jobs,
        total_failed_jobs: data.total_failed_jobs,
        total_jobs: data.total_jobs,
        jobs_by_location: data.jobs_by_location,
        jobs_by_os: data.jobs_by_os,
        accepted_jobs_by_month: data.accepted_jobs_by_month,
        rejected_jobs_by_months: data.rejected_jobs_by_months,
        percentage_increase_accepted_job: data.percentage_increase_accepted_job,
        percentage_increase_rejected_job: data.percentage_increase_rejected_job,
        percentage_increase_failed_job: data.percentage_increase_failed_job,
        accepted_credit_jobs_by_risk_level: data.accepted_credit_jobs_by_risk_level
      }
      console.log('stats:', this.dashboardStats)
      // Store in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('dashboardStats', JSON.stringify(this.dashboardStats))
      localStorage.setItem('role', JSON.stringify(this.role))
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
    },

    initFromStorage() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      const dashboardStats = localStorage.getItem('dashboardStats')
      const role = localStorage.getItem('role')
      const permissions = localStorage.getItem('permissions')
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) this.refreshToken = refreshToken

      if (token && user && dashboardStats && role && permissions) {
        this.isReady = true
        this.token = token
        this.user = JSON.parse(user)
        this.dashboardStats = JSON.parse(dashboardStats)
        this.role = JSON.parse(role)
        this.permissions = JSON.parse(permissions)
        console.log('✅ User store initialized')
      } else {
        this.isReady = true
        console.log('⚠️ No valid user data found in localStorage')
      }
    },

    logout() {
      this.token = ''
      this.user = null
      this.role = null
      this.permissions = []
      this.dashboardStats = null
      localStorage.clear()
    },

    hasPermission(permission: string) {
      return this.permissions.includes(permission)
    }
  }
})
