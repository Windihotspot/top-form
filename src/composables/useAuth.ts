// src/composables/useAuth.ts or in your <script setup>
import api from '@/api'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export const useLogin = () => {
  const userStore = useUserStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password })

      if (response.data.status === 'success') {
        const userData = response.data.data
        userStore.setUserData(userData)
        console.log('login response:', response)
        
        // ✅ Save to localStorage so guards can allow access
        localStorage.setItem('data', JSON.stringify(userData))
        localStorage.setItem('permissions', JSON.stringify(userData.user.role.permissions || []))
        // Navigate only on success
        router.push('/dashboard')
      } else {
        console.warn('Login failed:', response.data)
        throw new Error(response.data.message || 'Login failed')
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message)
      throw error.response?.data
    }
  }

  return { login }
}
