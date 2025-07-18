import { defineStore } from 'pinia'
import { supabase } from '@/supabase'
import axios from 'axios'

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
        // Call your onboarding backend endpoint (creates Supabase user + profile)
        const { data } = await axios.post('http://localhost:3000/api/onboarding', onboardingData)

        // Optionally fetch user after sign-up if you want
        await this.fetchUser()
        console.log("onboarding response:", data)
        return data
      } catch (err) {
        console.log(err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async login({ email, password }) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error

        this.user = data.user
        this.token = data.session.access_token
        return data
      } catch (err) {
        console.log(err)
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
