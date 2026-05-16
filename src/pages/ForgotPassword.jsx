import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../lib/api'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetUrl, setResetUrl] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    setResetUrl('')
    setCopied(false)

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      })

      setSuccess(response.data.message || 'Ссылка для сброса пароля готова.')
      setResetUrl(response.data.resetUrl || '')
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Не удалось подготовить сброс пароля')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResetUrl = async () => {
    if (!resetUrl) return

    try {
      await navigator.clipboard.writeText(resetUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch (copyError) {
      setError('Не удалось скопировать ссылку')
    }
  }

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md px-4 py-5 sm:px-6 sm:py-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Сброс пароля</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Введите email, и мы подготовим ссылку для смены пароля
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-6 space-y-3">
            <p>{success}</p>
            {resetUrl && (
              <div className="space-y-2">
                <p className="text-sm">Локальная тестовая ссылка:</p>
                <a
                  href={resetUrl}
                  className="block break-all text-sm underline text-primary-600 dark:text-primary-300"
                >
                  {resetUrl}
                </a>
                <button
                  type="button"
                  onClick={handleCopyResetUrl}
                  className="inline-flex items-center rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
                >
                  {copied ? 'Скопировано' : 'Скопировать ссылку'}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? 'Подготовка...' : 'Сбросить пароль'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
            Назад ко входу
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

export default ForgotPassword
