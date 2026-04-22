const express = require('express')
const Course = require('../models/Course')
const User = require('../models/User')
const { auth, adminAuth, staffAuth } = require('../middleware/auth')

const router = express.Router()

const mentorScopes = ['english', 'arabic', 'russian', 'frontend', 'backend', 'database']

const sanitizeUser = (user) => {
  const plainUser = user.toObject ? user.toObject() : user
  delete plainUser.password
  return plainUser
}

const normalizeCoursePayload = (payload = {}) => ({
  title: String(payload.title || '').trim(),
  description: String(payload.description || '').trim(),
  category: String(payload.category || '').trim(),
  courseKey: String(payload.courseKey || '').trim().toLowerCase(),
  icon: String(payload.icon || '📚').trim(),
  roadmap: Array.isArray(payload.roadmap) ? payload.roadmap : [],
  technologies: Array.isArray(payload.technologies) ? payload.technologies : [],
  lessons: Array.isArray(payload.lessons)
    ? payload.lessons.map((lesson, index) => ({
        lessonId: String(lesson.lessonId || `lesson-${index + 1}`).trim(),
        title: String(lesson.title || '').trim(),
        description: String(lesson.description || '').trim(),
        content: String(lesson.content || '').trim(),
        example: String(lesson.example || '').trim(),
        task: {
          type: lesson?.task?.type || 'input',
          question: String(lesson?.task?.question || '').trim(),
          answer: String(lesson?.task?.answer || '').trim(),
          options: Array.isArray(lesson?.task?.options) ? lesson.task.options : [],
        },
      }))
    : [],
  quiz: Array.isArray(payload.quiz)
    ? payload.quiz.map((item) => ({
        question: String(item?.question || '').trim(),
        options: Array.isArray(item?.options)
          ? item.options.map((option) => String(option || '').trim()).filter(Boolean)
          : [],
        correctIndex: Number.isInteger(item?.correctIndex) ? item.correctIndex : 0,
      }))
    : [],
})

const ensureMentorAccess = (req, courseKey) => {
  if (req.user.role !== 'mentor') return null

  if (!req.user.mentorScope) {
    return 'Для этого ментора не назначено направление'
  }

  if (req.user.mentorScope !== courseKey) {
    return `Ментор может работать только с направлением "${req.user.mentorScope}"`
  }

  return null
}

const buildCourseQuery = (req) => {
  if (req.user.role === 'mentor') {
    return { courseKey: req.user.mentorScope }
  }

  return {}
}

router.use(auth, staffAuth)

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find(buildCourseQuery(req)).sort({ updatedAt: -1, createdAt: -1 })
    res.json(courses)
  } catch (error) {
    console.error('Admin courses fetch error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.post('/courses', async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body)

    if (!payload.courseKey) {
      return res.status(400).json({ error: 'Нужно указать courseKey направления' })
    }

    const mentorAccessError = ensureMentorAccess(req, payload.courseKey)
    if (mentorAccessError) {
      return res.status(403).json({ error: mentorAccessError })
    }

    const course = new Course(payload)
    await course.save()
    res.status(201).json(course)
  } catch (error) {
    console.error('Admin create course error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.put('/courses/:id', async (req, res) => {
  try {
    const existingCourse = await Course.findById(req.params.id)
    if (!existingCourse) {
      return res.status(404).json({ error: 'Курс не найден' })
    }

    const existingAccessError = ensureMentorAccess(req, existingCourse.courseKey)
    if (existingAccessError) {
      return res.status(403).json({ error: existingAccessError })
    }

    const payload = normalizeCoursePayload(req.body)
    const targetCourseKey = payload.courseKey || existingCourse.courseKey
    const newAccessError = ensureMentorAccess(req, targetCourseKey)
    if (newAccessError) {
      return res.status(403).json({ error: newAccessError })
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...payload, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    res.json(course)
  } catch (error) {
    console.error('Admin update course error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.delete('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' })
    }

    const mentorAccessError = ensureMentorAccess(req, course.courseKey)
    if (mentorAccessError) {
      return res.status(403).json({ error: mentorAccessError })
    }

    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: 'Курс удален' })
  } catch (error) {
    console.error('Admin delete course error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role, mentorScope } = req.body

    if (!['user', 'admin', 'mentor'].includes(role)) {
      return res.status(400).json({ error: 'Неверная роль' })
    }

    if (role === 'mentor' && !mentorScopes.includes(mentorScope)) {
      return res.status(400).json({ error: 'Для ментора нужно указать корректное направление' })
    }

    const update = {
      role,
      mentorScope: role === 'mentor' ? mentorScope : null,
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(user)
  } catch (error) {
    console.error('Admin update user role error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя из админ панели' })
    }

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json({ message: 'Пользователь удален' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    if (req.user.role === 'mentor') {
      const managedCourses = await Course.countDocuments({ courseKey: req.user.mentorScope })

      return res.json({
        totalUsers: null,
        totalCourses: managedCourses,
        adminUsers: null,
        mentorUsers: null,
        managedScope: req.user.mentorScope,
      })
    }

    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const adminUsers = await User.countDocuments({ role: 'admin' })
    const mentorUsers = await User.countDocuments({ role: 'mentor' })

    res.json({
      totalUsers,
      totalCourses,
      adminUsers,
      mentorUsers,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    res.json(sanitizeUser(user))
  } catch (error) {
    console.error('Admin me error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
