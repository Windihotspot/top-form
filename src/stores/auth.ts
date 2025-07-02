// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null as any, // you can replace 'any' with a proper type if you want
    dashboardStats: null,
    role: null as any, // holds role info
    permissions: [] as string[] // holds permission strings
  }),
  actions: {
    setUserData(data: any) {
      console.log('✅ setUserData called')
      console.log('🚀 Raw user data from API:', data)
      this.token = data.token
      this.user = data.user
      this.role = data.user.role
      this.permissions = data.user.role?.permissions || []

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
