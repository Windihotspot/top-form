import { defineStore } from 'pinia'
import api from '../services/api'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
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
        this.token = response.data.data.token
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
    },

    async fetchUser() {
      const { data, error } = await supabase.auth.getUser()
      if (!error) this.user = data.user
    }
  }
})
