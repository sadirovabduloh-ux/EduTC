import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [providers, setProviders] = useState({ google: false, apple: false })
  const [error, setError] = useState('')
  const { login, loginWithGoogle, loginWithApple } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await api.get('/auth/providers')
        setProviders(response.data)
      } catch (loadError) {
        console.error('Failed to load auth providers:', loadError)
      }
    }

    loadProviders()
  }, [])

  useEffect(() => {
    const authError = searchParams.get('error')

    if (authError === 'google_not_configured') {
      setError('Вход через Google пока не настроен: нужно указать реальные OAuth ключи на сервере.')
    } else if (authError === 'apple_not_configured') {
      setError('Вход через Apple/iCloud пока не настроен: нужны Apple Developer credentials на сервере.')
    } else if (authError) {
      setError('Ошибка авторизации через внешний провайдер')
    }
  }, [searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData.email.trim().toLowerCase(), formData.password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Вход в аккаунт
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Войдите, чтобы продолжить обучение
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                или
              </span>
            </div>
          </div>

          <button
            onClick={loginWithGoogle}
            disabled={!providers.google}
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти через Google
          </button>

          <button
            onClick={loginWithApple}
            disabled={!providers.apple}
            className="mt-3 flex w-full items-center justify-center rounded-lg bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          >
            <span className="text-lg mr-2"></span>
            Войти через Apple / iCloud
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  )
}

export default Login
