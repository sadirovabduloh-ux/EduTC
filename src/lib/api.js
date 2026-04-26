import axios from 'axios'

const envApiBaseUrl = String(import.meta.env.VITE_API_URL || '').trim()

export const API_BASE_URL =
  envApiBaseUrl || (import.meta.env.DEV ? '/api' : 'https://edutc-backend.onrender.com/api')

const api = axios.create({
  baseURL: API_BASE_URL,
})

export const setApiToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export default api
