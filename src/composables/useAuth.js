import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export const useAuth = () => {
  const auth = useAuthStore()
  const {school_id, user, token,loading} = storeToRefs(auth)

  return {
    school_id,
    user,
    token,
    loading,
    signup: auth.signup,
    login: auth.login,
    logout: auth.logout,
    fetchUser: auth.fetchUser
  }
}
