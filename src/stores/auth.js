// stores/auth.js
import { defineStore } from 'pinia'
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
    // 🔹 Signup (Supabase Auth + related rows)
    // inside actions of your auth store
    async signup(onboardingData) {
      this.loading = true
      try {
        const { admin, school } = onboardingData
        console.log('onboarding data:', onboardingData)

        // 1. Create Supabase auth user
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: admin.email,
          password: admin.password,
          options: {
            data: {
              fullname: admin.fullname, // ✅ lowercase
              phone: admin.phone,
              role: admin.role
            },
             emailRedirectTo: 'http://localhost:3002/auth/callback'
          }
        })
        if (signupError) throw signupError
        const { user, session } = signupData
        console.log('school data:', onboardingData.school)

        // 2. Insert into `schools` table
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert([
            {
              name: school.name, // ✅ required
              address: school.address || null,
              city: school.city || null,
              state: school.state || null,
              contact: school.contact || null,
              type: school.type || null
            }
          ])
          .select()
          .single()
        if (schoolError) throw schoolError
          console.log('Admin data:', onboardingData.admin)

        // 3. Insert admin profile (link to auth user + school)
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .insert([
            {
              user_id: user.id,
              fullname: admin.fullname, // ✅ matches schema
              email: admin.email, // ✅ required
              phone: admin.phone || null,
              role: admin.role || 'Owner/Admin',
              school_id: schoolData.id
            }
          ])
          .select()
          .single()
        if (adminError) throw adminError

        // 4. Save state + localStorage
        this.user = user
        this.admin = adminData
        this.token = session?.access_token || null

        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('admin', JSON.stringify(this.admin))
        if (this.token) localStorage.setItem('token', this.token)

        return { user: this.user, admin: this.admin }
      } catch (err) {
        console.error('Signup error:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // 🔹 Login (Supabase Auth)
    async login({ email, password }) {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        this.user = data.user
        this.token = data.session?.access_token || null

        // Fetch admin profile
        const { data: adminProfile } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', this.user.id)
          .single()
        this.admin = adminProfile || null

        // Persist
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('admin', JSON.stringify(this.admin))
        localStorage.setItem('token', this.token)

        return { user: this.user, admin: this.admin }
      } finally {
        this.loading = false
      }
    },

    // 🔹 Logout
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      this.admin = null
      this.token = null
      localStorage.removeItem('user')
      localStorage.removeItem('admin')
      localStorage.removeItem('token')
    },

    // 🔹 Restore user on refresh
    async fetchUser() {
      const { data, error } = await supabase.auth.getUser()
      if (!error && data.user) {
        this.user = data.user
        localStorage.setItem('user', JSON.stringify(this.user))

        const { data: adminProfile } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', this.user.id)
          .single()
        this.admin = adminProfile || null
        localStorage.setItem('admin', JSON.stringify(this.admin))
      }
    },

    // 🔹 Avatar update
    updateAvatar(url) {
      if (this.admin) {
        this.admin.avatar_url = url
        this.avatarRefreshKey = Date.now()
        localStorage.setItem('admin', JSON.stringify(this.admin))
      }
    }
  }
})
