import { defineStore } from 'pinia'
import api from '../services/api'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    admin: JSON.parse(localStorage.getItem('admin')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    avatarRefreshKey: Date.now()
  }),

  actions: {
    async signup(onboardingData) {
      this.loading = true
      try {
        const { data } = await api.post('/onboarding', onboardingData)
        await this.fetchUser()
        return data
      } catch (err) {
        console.log('error:', err)
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      try {
        const response = await api.post('/auth/login', { email, password })
        console.log('Backend login response:', response.data)
        this.user = response.data.data.user
        this.admin = response.data.data.admin // <-- Add this line
        this.token = response.data.data.token
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.school_id = response.data.data.admin.school_id
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('admin', JSON.stringify(this.admin)) // <-- Save it
        localStorage.setItem('token', this.token)

        return response.data
      } catch (err) {
        console.error('Login error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        // Tell backend to log out & revoke Supabase session
        await api.post(
          '/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          }
        )
      } catch (err) {
        console.error('Logout error:', err)
        // Even if backend fails, still clear frontend state
      }

      // Frontend cleanup
      await supabase.auth.signOut()
      this.user = null
      this.admin = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('admin')
      localStorage.removeItem('token')

      // 🔹 Remove token from API defaults
      delete api.defaults.headers.common['Authorization']
    },
    async fetchUser() {
      const { data, error } = await supabase.auth.getUser()
      if (!error) this.user = data.user
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    updateAvatar(url) {
      if (this.admin) {
        this.admin.avatar_url = url
        this.avatarRefreshKey = Date.now() // force refresh only when updated
      }
    }
  }
})
