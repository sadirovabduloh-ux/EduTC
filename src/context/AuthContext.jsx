import { createContext, useContext, useState, useEffect } from 'react'
import api, { API_BASE_URL, setApiToken } from '../lib/api'

const AuthContext = createContext()
const LOCAL_USERS_KEY = 'edutc_local_users'
const LOCAL_AUTH_TOKEN_PREFIX = 'local-demo-token:'
const LOCAL_DEFAULT_PASSWORD = 'Admin123!'

const seedLocalUsers = () => {
  const existing = localStorage.getItem(LOCAL_USERS_KEY)
  if (existing) {
    try {
      const parsed = JSON.parse(existing)
      if (Array.isArray(parsed) && parsed.length) return parsed
    } catch (error) {
      console.error('Failed to parse local users:', error)
    }
  }

  const now = new Date().toISOString()
  const seededUsers = [
    {
      _id: 'local-admin-sadirov',
      id: 'local-admin-sadirov',
      name: 'Abdulloh Sadirov',
      email: 'sadirov@gmail.com',
      password: LOCAL_DEFAULT_PASSWORD,
      role: 'admin',
      mentorScope: null,
      provider: 'email',
      avatar: '',
      score: 180,
      completedLessons: 14,
      createdAt: now,
    },
    {
      _id: 'local-user-amina',
      id: 'local-user-amina',
      name: 'Amina',
      email: 'amina.demo@edutc.local',
      password: 'demo123',
      role: 'user',
      mentorScope: null,
      provider: 'email',
      avatar: '',
      score: 145,
      completedLessons: 12,
      createdAt: now,
    },
  ]

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seededUsers))
  return seededUsers
}

const getLocalUsers = () => {
  try {
    return seedLocalUsers()
  } catch (error) {
    console.error('Failed to load local users:', error)
    return []
  }
}

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

const isLocalToken = (value) => String(value || '').startsWith(LOCAL_AUTH_TOKEN_PREFIX)

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

  const buildLocalToken = (userId) => `${LOCAL_AUTH_TOKEN_PREFIX}${userId}`

  const getLocalUserByToken = (value) => {
    if (!isLocalToken(value)) return null
    const userId = String(value).slice(LOCAL_AUTH_TOKEN_PREFIX.length)
    return getLocalUsers().find((item) => item._id === userId || item.id === userId) || null
  }

  const loginLocal = (email, password) => {
    const users = getLocalUsers()
    const matchedUser = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    )

    if (!matchedUser) {
      return { success: false, error: 'Неверные учетные данные' }
    }

    applyAuth(buildLocalToken(matchedUser._id || matchedUser.id), matchedUser)
    return { success: true, mode: 'local' }
  }

  const registerLocal = (name, email, password) => {
    const users = getLocalUsers()
    const normalizedEmail = email.toLowerCase()
    const localId = `local-user-${Date.now()}`

    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Пользователь уже существует' }
    }

    const nextUser = {
      _id: localId,
      id: localId,
      name,
      email: normalizedEmail,
      password,
      role: 'user',
      mentorScope: null,
      provider: 'email',
      avatar: '',
      score: 0,
      completedLessons: 0,
      createdAt: new Date().toISOString(),
    }

    const nextUsers = [...users, nextUser]
    saveLocalUsers(nextUsers)
    applyAuth(buildLocalToken(nextUser._id), nextUser)
    return { success: true, mode: 'local' }
  }

  useEffect(() => {
    setApiToken(token)
  }, [token])

  // Загрузка профиля при монтировании
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        if (isLocalToken(token)) {
          const localUser = getLocalUserByToken(token)
          if (localUser) {
            setUser(normalizeUser(localUser))
          } else {
            logout()
          }
          setLoading(false)
          return
        }

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
      if (!error.response) {
        return loginLocal(email, password)
      }
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
      if (!error.response) {
        return registerLocal(name, email, password)
      }
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
      if (isLocalToken(nextToken)) {
        const localUser = getLocalUserByToken(nextToken)
        if (!localUser) {
          applyAuth(null)
          return { success: false, error: 'Не удалось восстановить сессию' }
        }
        applyAuth(nextToken, localUser)
        return { success: true }
      }

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
      if (isLocalToken(token) && user) {
        const users = getLocalUsers()
        const updatedUsers = users.map((item) => {
          if ((item._id || item.id) !== (user._id || user.id)) return item

          const nextScore =
            action === 'correct_answer'
              ? (item.score || 0) + 10
              : action === 'test_complete'
              ? (item.score || 0) + 25
              : item.score || 0

          const nextCompletedLessons =
            action === 'lesson_complete' ? (item.completedLessons || 0) + 1 : item.completedLessons || 0

          return {
            ...item,
            score: nextScore,
            completedLessons: nextCompletedLessons,
          }
        })

        saveLocalUsers(updatedUsers)
        const nextUser = updatedUsers.find((item) => (item._id || item.id) === (user._id || user.id))
        if (nextUser) {
          setUser(normalizeUser(nextUser))
          return nextUser
        }
      }

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
