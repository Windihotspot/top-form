import axios from 'axios'


// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT from store to every request
api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token')
  console.log('Auth token:', token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

export default api
