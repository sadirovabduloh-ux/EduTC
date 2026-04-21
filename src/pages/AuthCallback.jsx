import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const [message, setMessage] = useState('Завершаем вход...')

  useEffect(() => {
    const finishAuth = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error || !token) {
        navigate('/login?error=auth_failed', { replace: true })
        return
      }

      const result = await loginWithToken(token)

      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setMessage('Не удалось завершить вход. Перенаправляем...')
        setTimeout(() => navigate('/login?error=auth_failed', { replace: true }), 1200)
      }
    }

    finishAuth()
  }, [loginWithToken, navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Авторизация</h1>
        <p className="text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </div>
  )
}

export default AuthCallback
