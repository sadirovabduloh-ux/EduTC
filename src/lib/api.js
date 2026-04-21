import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5002/api'

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
