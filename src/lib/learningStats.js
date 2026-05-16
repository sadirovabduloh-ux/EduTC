const SESSION_KEY_PREFIX = 'edutc-learning-session:'
const STATS_KEY_PREFIX = 'edutc-learning-stats:'

export const directionLabels = {
  english: 'Английский',
  arabic: 'Арабский',
  russian: 'Русский',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
}

const createDefaultStats = () => ({
  totalTimeMs: 0,
  totalSessions: 0,
  firstSeenAt: null,
  lastSeenAt: null,
  directions: {},
})

const getStatsKey = (userId) => `${STATS_KEY_PREFIX}${userId}`
const getSessionKey = (userId) => `${SESSION_KEY_PREFIX}${userId}`

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

const sanitizeStats = (rawStats) => {
  const stats = rawStats && typeof rawStats === 'object' ? rawStats : {}
  const directions = stats.directions && typeof stats.directions === 'object' ? stats.directions : {}

  return {
    totalTimeMs: Number(stats.totalTimeMs || 0),
    totalSessions: Number(stats.totalSessions || 0),
    firstSeenAt: stats.firstSeenAt || null,
    lastSeenAt: stats.lastSeenAt || null,
    directions: Object.entries(directions).reduce((acc, [key, value]) => {
      const lessonIds = Array.isArray(value?.lessonIds)
        ? Array.from(new Set(value.lessonIds.map((item) => String(item))))
        : []
      acc[key] = { lessonIds }
      return acc
    }, {}),
  }
}

export const loadLearningStats = (userId) => {
  if (!userId) return createDefaultStats()
  const rawValue = localStorage.getItem(getStatsKey(userId))
  if (!rawValue) return createDefaultStats()
  return sanitizeStats(parseJson(rawValue, createDefaultStats()))
}

export const saveLearningStats = (userId, stats) => {
  if (!userId) return stats
  const sanitized = sanitizeStats(stats)
  localStorage.setItem(getStatsKey(userId), JSON.stringify(sanitized))
  return sanitized
}

export const ensureLearningSession = (userId) => {
  if (!userId) return createDefaultStats()

  const now = Date.now()
  const stats = loadLearningStats(userId)
  const sessionKey = getSessionKey(userId)
  const currentSession = parseJson(sessionStorage.getItem(sessionKey), null)

  if (!currentSession?.startedAt) {
    stats.totalSessions += 1
    stats.firstSeenAt = stats.firstSeenAt || new Date(now).toISOString()
    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({
        startedAt: now,
        lastTrackedAt: now,
      })
    )
  }

  stats.lastSeenAt = new Date(now).toISOString()
  return saveLearningStats(userId, stats)
}

export const getCurrentSessionDuration = (userId) => {
  if (!userId) return 0
  const currentSession = parseJson(sessionStorage.getItem(getSessionKey(userId)), null)
  if (!currentSession?.startedAt) return 0
  return Math.max(0, Date.now() - Number(currentSession.startedAt))
}

export const flushLearningSession = (userId) => {
  if (!userId) return createDefaultStats()

  const sessionKey = getSessionKey(userId)
  const currentSession = parseJson(sessionStorage.getItem(sessionKey), null)
  const now = Date.now()
  const stats = loadLearningStats(userId)

  if (!currentSession?.lastTrackedAt) {
    stats.lastSeenAt = new Date(now).toISOString()
    return saveLearningStats(userId, stats)
  }

  const delta = Math.max(0, now - Number(currentSession.lastTrackedAt))
  stats.totalTimeMs += delta
  stats.lastSeenAt = new Date(now).toISOString()

  sessionStorage.setItem(
    sessionKey,
    JSON.stringify({
      startedAt: currentSession.startedAt,
      lastTrackedAt: now,
    })
  )

  return saveLearningStats(userId, stats)
}

export const endLearningSession = (userId) => {
  if (!userId) return createDefaultStats()
  const stats = flushLearningSession(userId)
  sessionStorage.removeItem(getSessionKey(userId))
  return stats
}

export const recordLessonCompletion = (userId, directionKey, lessonId) => {
  if (!userId || !directionKey || !lessonId) return createDefaultStats()

  const stats = loadLearningStats(userId)
  const currentDirection = stats.directions[directionKey] || { lessonIds: [] }
  const lessonIds = new Set(currentDirection.lessonIds || [])
  lessonIds.add(String(lessonId))

  stats.directions[directionKey] = {
    lessonIds: Array.from(lessonIds),
  }
  stats.lastSeenAt = new Date().toISOString()

  return saveLearningStats(userId, stats)
}

export const getDirectionStatsList = (stats) =>
  Object.entries(stats?.directions || {})
    .map(([key, value]) => ({
      key,
      label: directionLabels[key] || key,
      lessonsCompleted: Array.isArray(value?.lessonIds) ? value.lessonIds.length : 0,
    }))
    .filter((item) => item.lessonsCompleted > 0)
    .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)

export const formatDuration = (durationMs) => {
  const totalSeconds = Math.max(0, Math.floor((durationMs || 0) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours} ч ${minutes} мин`
  }

  if (minutes > 0) {
    return `${minutes} мин ${seconds} сек`
  }

  return `${seconds} сек`
}
