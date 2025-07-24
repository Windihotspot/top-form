import { defineStore } from 'pinia'
import api from '../services/api'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false
  }),

  actions: {
    async signup(onboardingData) {
      this.loading = true
      try {
        const { data } = await api.post('/onboarding', onboardingData)
        await this.fetchUser()
        return data
      } catch (err) {
        throw err
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
      await supabase.auth.signOut()
      this.user = null
      this.token = null
      localStorage.removeItem('admin')
      this.admin = null

      // ✅ Clear from localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },

    async fetchUser() {
      const { data, error } = await supabase.auth.getUser()
      if (!error) this.user = data.user
      localStorage.setItem('user', JSON.stringify(this.user))
    }
  }
})
