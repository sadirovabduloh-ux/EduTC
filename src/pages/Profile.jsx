import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { formatDuration, getDirectionStatsList } from '../lib/learningStats'

const roleLabels = {
  user: 'Ученик',
  mentor: 'Ментор',
  admin: 'Администратор',
}

const StatCard = ({ label, value, hint }) => (
  <div className="card">
    <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
    {hint ? <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">{hint}</div> : null}
  </div>
)

const Profile = () => {
  const { user, learningStats, sessionDurationMs, updateProfileAvatar, updateProfileName } = useAuth()
  const [nameDraft, setNameDraft] = useState(user?.name || '')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameError, setNameError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [avatarError, setAvatarError] = useState('')
  const [avatarSaving, setAvatarSaving] = useState(false)
  const fileInputRef = useRef(null)

  const directionStats = getDirectionStatsList(learningStats)
  const totalDirectionLessons = directionStats.reduce((sum, item) => sum + item.lessonsCompleted, 0)
  const joinedAt = user?.createdAt ? new Date(user.createdAt) : null
  const lastSeenAt = learningStats?.lastSeenAt ? new Date(learningStats.lastSeenAt) : null

  useEffect(() => {
    setAvatarPreview(user?.avatar || '')
  }, [user?.avatar])

  useEffect(() => {
    setNameDraft(user?.name || '')
  }, [user?.name])

  const handleChooseAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setAvatarError('Можно выбрать только изображение')
      return
    }

    if (file.size > 1_500_000) {
      setAvatarError('Фото слишком большое. Выберите изображение до 1.5 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(String(reader.result || ''))
      setAvatarError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSaveAvatar = async () => {
    setAvatarSaving(true)
    setAvatarError('')
    const result = await updateProfileAvatar(avatarPreview)
    setAvatarSaving(false)

    if (!result.success) {
      setAvatarError(result.error || 'Не удалось сохранить фото')
    }
  }

  const handleRemoveAvatar = async () => {
    setAvatarSaving(true)
    setAvatarError('')
    setAvatarPreview('')
    const result = await updateProfileAvatar('')
    setAvatarSaving(false)

    if (!result.success) {
      setAvatarError(result.error || 'Не удалось удалить фото')
      setAvatarPreview(user?.avatar || '')
    }
  }

  const handleSaveName = async () => {
    setNameSaving(true)
    setNameError('')
    const result = await updateProfileName(nameDraft)
    setNameSaving(false)

    if (!result.success) {
      setNameError(result.error || 'Не удалось обновить имя')
    }
  }

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="card">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500 text-3xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                <div className="mt-2 text-base text-gray-600 dark:text-gray-300">{user?.email}</div>
                <div className="mt-3 inline-flex rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {roleLabels[user?.role] || 'Пользователь'}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/40 bg-white/50 p-4 dark:border-white/10 dark:bg-gray-800/60">
              <div className="mb-4 border-b border-white/30 pb-4 dark:border-white/10">
                <div className="text-sm text-gray-500 dark:text-gray-400">Имя профиля</div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Введите ваше имя"
                  />
                  <button
                    type="button"
                    onClick={handleSaveName}
                    disabled={nameSaving || nameDraft.trim() === (user?.name || '').trim()}
                    className="btn btn-primary whitespace-nowrap"
                  >
                    {nameSaving ? 'Сохраняем...' : 'Сохранить имя'}
                  </button>
                </div>
                {nameError ? (
                  <div className="mt-3 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {nameError}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Фото профиля</div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    Можешь поставить свою фотографию, и она будет видна в профиле и в меню аккаунта.
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleChooseAvatar} className="btn btn-secondary">
                    Выбрать фото
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    disabled={avatarSaving || avatarPreview === (user?.avatar || '')}
                    className="btn btn-primary"
                  >
                    {avatarSaving ? 'Сохраняем...' : 'Сохранить фото'}
                  </button>
                  {avatarPreview ? (
                    <button type="button" onClick={handleRemoveAvatar} disabled={avatarSaving} className="btn btn-secondary">
                      Удалить фото
                    </button>
                  ) : null}
                </div>
              </div>
              {avatarError ? (
                <div className="mt-3 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {avatarError}
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/40 bg-white/50 p-4 text-sm text-gray-700 shadow-sm dark:border-white/10 dark:bg-gray-800/70 dark:text-gray-300">
                <div className="text-gray-500 dark:text-gray-400">Вы обучаетесь на сайте</div>
                <div className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {directionStats.length > 0
                    ? directionStats.map((item) => `${item.label}: ${item.lessonsCompleted}`).join(' • ')
                    : 'Пока нет завершённых уроков'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/40 bg-white/50 p-4 text-sm text-gray-700 shadow-sm dark:border-white/10 dark:bg-gray-800/70 dark:text-gray-300">
                <div className="text-gray-500 dark:text-gray-400">Активность</div>
                <div className="mt-2 font-semibold text-gray-900 dark:text-white">
                  Сессий: {learningStats?.totalSessions || 0} • Времени: {formatDuration(learningStats?.totalTimeMs || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <StatCard label="Очки" value={user?.score || 0} hint="Сумма баллов за уроки и задания" />
            <StatCard label="Все завершённые уроки" value={user?.completedLessons || 0} hint="Общий счётчик по аккаунту" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard label="Уроков по направлениям" value={totalDirectionLessons} hint="Уникальные уроки, отмеченные в профиле" />
          <StatCard label="Текущая сессия" value={formatDuration(sessionDurationMs)} hint="Сколько вы сидите сейчас" />
          <StatCard
            label="Всего времени на сайте"
            value={formatDuration(learningStats?.totalTimeMs || 0)}
            hint="Накопленное время во всех входах"
          />
          <StatCard
            label="Дата регистрации"
            value={joinedAt ? joinedAt.toLocaleDateString('ru-RU') : '—'}
            hint={lastSeenAt ? `Последняя активность: ${lastSeenAt.toLocaleString('ru-RU')}` : 'Последняя активность пока не записана'}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mt-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Направления обучения</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Здесь видно, по каким направлениям вы уже проходили уроки и сколько именно завершили.
              </p>
            </div>
          </div>

          {directionStats.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {directionStats.map((item) => (
                <div
                  key={item.key}
                  className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-sm dark:border-white/10 dark:bg-gray-800/70"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">Направление</div>
                  <div className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">{item.label}</div>
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">Завершено уроков</div>
                  <div className="mt-1 text-2xl font-bold text-primary-600 dark:text-primary-300">
                    {item.lessonsCompleted}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-gray-300 px-5 py-8 text-center text-gray-600 dark:border-gray-700 dark:text-gray-300">
              Пока нет пройденных уроков. Начни обучение, и статистика появится здесь автоматически.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default Profile
