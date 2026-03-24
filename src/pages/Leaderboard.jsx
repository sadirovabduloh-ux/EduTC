import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const Leaderboard = () => {
  const { user } = useAuth()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const response = await axios.get('/leaderboard')
        setBoard(response.data)
      } catch (error) {
        console.error('Leaderboard loading failed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  return (
    <section className="min-h-screen py-20 px-4 pt-32">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Таблица лидеров
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Лучшие ученики по баллам и завершенным урокам
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {board.slice(0, 3).map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl shadow-lg ${
                i === 0 ? 'bg-yellow-100 border border-yellow-300' : i === 1 ? 'bg-gray-100 border border-gray-300' : 'bg-orange-100 border border-orange-300'
              }`}
            >
              <div className="text-5xl mb-4">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary-500 text-white text-2xl flex items-center justify-center">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{u.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{u.email}</p>
                <p className="text-lg text-gray-800 dark:text-gray-100">Очки: {u.score || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Пройдено уроков: {u.completedLessons || 0}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          {board.slice(3).map((u, i) => {
            const rank = i + 4
            const isCurrent = user && user.id === u._id
            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border flex items-center justify-between ${isCurrent ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="font-bold w-8">{rank}</div>
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{u.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-300">Очки: {u.score || 0}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Уроков: {u.completedLessons || 0}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Leaderboard
