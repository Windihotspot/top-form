import axios from 'axios'
import { supabase } from '@/supabase'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding token
api.interceptors.request.use(async (config) => {
  const { data, error } = await supabase.auth.getSession()
  if (data.session) {
    config.headers.Authorization = `Bearer ${data.session.access_token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api
