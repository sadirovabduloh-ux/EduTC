import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { fallbackLeaderboard } from '../data/fallbackContent'

const Leaderboard = () => {
  const { user } = useAuth()
  const [board, setBoard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const response = await api.get('/leaderboard')
        const nextBoard = Array.isArray(response.data) && response.data.length ? response.data : fallbackLeaderboard
        setBoard(nextBoard)
      } catch (error) {
        console.error('Leaderboard loading failed:', error)
        setBoard(fallbackLeaderboard)
      } finally {
        setLoading(false)
      }
    }

    loadBoard()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  const podium = [board[1], board[0], board[2]].filter(Boolean)
  const podiumMeta = [
    {
      place: 2,
      medal: '🥈',
      height: 'md:mt-16',
      cardTone: 'from-slate-100/88 to-slate-200/72 border-slate-300/80 dark:from-slate-800/88 dark:to-slate-900/70 dark:border-slate-600/70',
      standTone: 'bg-slate-300/85 dark:bg-slate-700/80',
    },
    {
      place: 1,
      medal: '🥇',
      height: 'md:-mt-2',
      cardTone: 'from-amber-100/90 to-yellow-200/78 border-amber-300/80 dark:from-amber-900/45 dark:to-yellow-900/30 dark:border-amber-700/70',
      standTone: 'bg-amber-300/90 dark:bg-amber-700/85',
    },
    {
      place: 3,
      medal: '🥉',
      height: 'md:mt-24',
      cardTone: 'from-orange-100/88 to-amber-200/72 border-orange-300/80 dark:from-orange-900/40 dark:to-amber-900/30 dark:border-orange-700/70',
      standTone: 'bg-orange-300/85 dark:bg-orange-700/80',
    },
  ]

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Таблица лидеров
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 sm:text-lg">
            Лучшие ученики по баллам и завершенным урокам
          </p>
        </motion.div>

        <div className="mb-10 grid grid-cols-1 items-end gap-5 md:grid-cols-3">
          {podium.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col ${podiumMeta[i].height}`}
            >
              <div className={`rounded-[24px] border bg-gradient-to-b p-5 text-center shadow-[0_20px_44px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-6 ${podiumMeta[i].cardTone}`}>
                <div className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-gray-600 dark:text-gray-300">
                  {podiumMeta[i].place} место
                </div>
                <div className="mb-4 text-4xl sm:text-5xl">{podiumMeta[i].medal}</div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-xl text-white shadow-[0_14px_28px_rgba(10,132,255,0.28)] sm:h-16 sm:w-16 sm:text-2xl">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">{u.name}</h3>
                <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-300">{u.email}</p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-left sm:gap-3">
                  <div className="rounded-2xl bg-white/55 px-3 py-3 dark:bg-white/5">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Очки</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{u.score || 0}</div>
                  </div>
                  <div className="rounded-2xl bg-white/55 px-3 py-3 dark:bg-white/5">
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Уроки</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{u.completedLessons || 0}</div>
                  </div>
                </div>
              </div>
              <div className={`mx-auto h-16 w-[72%] rounded-t-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] sm:h-20 sm:rounded-t-[26px] ${podiumMeta[i].standTone} ${podiumMeta[i].place === 1 ? 'md:h-28' : podiumMeta[i].place === 2 ? 'md:h-20' : 'md:h-14'}`} />
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          {board.slice(3).map((u, i) => {
            const rank = i + 4
            const isCurrent = user && (user.id === u._id || user._id === u._id)
            return (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-xl border flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${isCurrent ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="font-bold w-8">{rank}</div>
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center">{u.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white">{u.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 break-all">{u.email}</div>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
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
