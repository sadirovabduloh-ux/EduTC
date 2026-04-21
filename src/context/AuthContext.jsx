import { createContext, useContext, useState, useEffect } from 'react'
import api, { API_BASE_URL, setApiToken } from '../lib/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const normalizeUser = (rawUser) => {
    if (!rawUser) return null

    return {
      ...rawUser,
      id: rawUser.id || rawUser._id,
      _id: rawUser._id || rawUser.id,
    }
  }

  const applyAuth = (nextToken, nextUser = null) => {
    setToken(nextToken)
    setApiToken(nextToken)

    if (nextToken) {
      localStorage.setItem('token', nextToken)
    } else {
      localStorage.removeItem('token')
    }

    if (nextUser) {
      setUser(normalizeUser(nextUser))
    }
  }

  useEffect(() => {
    setApiToken(token)
  }, [token])

  // Загрузка профиля при монтировании
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile')
          setUser(normalizeUser(response.data))
        } catch (error) {
          console.error('Failed to load user:', error)
          logout()
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data

      applyAuth(token, user)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password })
      const { user, token } = response.data

      applyAuth(token, user)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`
  }

  const loginWithApple = () => {
    window.location.href = `${API_BASE_URL}/auth/apple`
  }

  const loginWithToken = async (nextToken) => {
    try {
      applyAuth(nextToken)
      const response = await api.get('/auth/profile')
      setUser(normalizeUser(response.data))
      return { success: true }
    } catch (error) {
      applyAuth(null)
      return { success: false, error: 'Не удалось восстановить сессию' }
    }
  }

  const logout = () => {
    setUser(null)
    applyAuth(null)
  }

  const updateScore = async (action) => {
    try {
      const response = await api.patch('/score', { action })
      if (response.data) {
        setUser(normalizeUser(response.data))
      }
      return response.data
    } catch (error) {
      console.error('Score update failed:', error)
      return null
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithGoogle,
    loginWithApple,
    loginWithToken,
    logout,
    updateScore,
    isAdmin: user?.role === 'admin',
    isMentor: user?.role === 'mentor'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
