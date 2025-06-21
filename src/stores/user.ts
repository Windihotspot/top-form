// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null as any,
    dashboardStats: null as any,
    permissions: [] as string[]
  }),
  actions: {
    setUserData(data: any) {
      this.token = data.token
      this.user = data.user

      // extract permissions
      this.permissions = data.user?.role?.permissions || []

      this.dashboardStats = {
        total_accepted_jobs: data.total_accepted_jobs,
        total_rejected_jobs: data.total_rejected_jobs,
        total_jobs: data.total_jobs,
        jobs_by_location: data.jobs_by_location,
        jobs_by_os: data.jobs_by_os,
        accepted_jobs_by_month: data.accepted_jobs_by_month,
        rejected_jobs_by_months: data.rejected_jobs_by_months
      }

      // Store in localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.setItem('permissions', JSON.stringify(this.permissions))
      localStorage.setItem('dashboardStats', JSON.stringify(this.dashboardStats))
    },

    hasPermission(permission: string) {
      return this.permissions.includes(permission)
    },

    initFromStorage() {
      const user = localStorage.getItem('user')
      const permissions = localStorage.getItem('permissions')
      const dashboardStats = localStorage.getItem('dashboardStats')
      const token = localStorage.getItem('token')

      if (user) this.user = JSON.parse(user)
      if (permissions) this.permissions = JSON.parse(permissions)
      if (dashboardStats) this.dashboardStats = JSON.parse(dashboardStats)
      if (token) this.token = token
    },

    logout() {
      this.token = ''
      this.user = null
      this.permissions = []
      this.dashboardStats = null
      localStorage.clear()
    }
  }
})
