import { fallbackCourses, fallbackLeaderboard } from '../data/fallbackContent'

export const LOCAL_USERS_KEY = 'edutc_local_users'
export const LOCAL_COURSES_KEY = 'edutc_local_courses'
export const LOCAL_AUTH_TOKEN_PREFIX = 'local-demo-token:'
export const LOCAL_DEFAULT_PASSWORD = 'Admin123!'

const clone = (value) => JSON.parse(JSON.stringify(value))

const defaultLocalUsers = () => {
  const now = new Date().toISOString()

  return [
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
    {
      _id: 'local-user-bekzat',
      id: 'local-user-bekzat',
      name: 'Bekzat',
      email: 'bekzat.demo@edutc.local',
      password: 'demo123',
      role: 'user',
      mentorScope: null,
      provider: 'email',
      avatar: '',
      score: 110,
      completedLessons: 9,
      createdAt: now,
    },
  ]
}

export const isLocalToken = (value) => String(value || '').startsWith(LOCAL_AUTH_TOKEN_PREFIX)
export const buildLocalToken = (userId) => `${LOCAL_AUTH_TOKEN_PREFIX}${userId}`

export const getLocalUsers = () => {
  try {
    const existing = localStorage.getItem(LOCAL_USERS_KEY)
    if (existing) {
      const parsed = JSON.parse(existing)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch (error) {
    console.error('Failed to parse local users:', error)
  }

  const seeded = defaultLocalUsers()
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(seeded))
  return seeded
}

export const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
}

export const getLocalCourses = () => {
  try {
    const existing = localStorage.getItem(LOCAL_COURSES_KEY)
    if (existing) {
      const parsed = JSON.parse(existing)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch (error) {
    console.error('Failed to parse local courses:', error)
  }

  const seeded = clone(fallbackCourses)
  localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(seeded))
  return seeded
}

export const saveLocalCourses = (courses) => {
  localStorage.setItem(LOCAL_COURSES_KEY, JSON.stringify(courses))
}

export const getEffectiveCourses = (remoteCourses) =>
  Array.isArray(remoteCourses) && remoteCourses.length ? remoteCourses : getLocalCourses()

export const getEffectiveCourseByKey = (courseKey, remoteCourse = null) => {
  if (remoteCourse) return remoteCourse
  return getLocalCourses().find((course) => course.courseKey === courseKey) || null
}

export const getEffectiveLeaderboard = (remoteBoard) => {
  if (Array.isArray(remoteBoard) && remoteBoard.length) return remoteBoard

  const users = getLocalUsers()
    .map(({ password, ...user }) => user)
    .sort((a, b) => (b.score || 0) - (a.score || 0))

  return users.length ? users : fallbackLeaderboard
}

export const buildLocalStats = (users, courses, mentorScope = '') => ({
  totalUsers: users.length,
  totalCourses: courses.length,
  mentorUsers: users.filter((item) => item.role === 'mentor').length,
  mentorCourses: mentorScope ? courses.filter((item) => item.courseKey === mentorScope).length : courses.length,
})
