const express = require('express')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { requireDbReady } = require('../middleware/dbReady')

const router = express.Router()

// Топ лидерборда
router.get('/leaderboard', requireDbReady, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ score: -1, completedLessons: -1, createdAt: 1 }).limit(50)
    res.json(users)
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Обновление очков пользователя
router.patch('/score', auth, requireDbReady, async (req, res) => {
  try {
    const { action } = req.body
    if (!action) {
      return res.status(400).json({ error: 'Необходимо указать action' })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    let scoreDelta = 0
    let completedLessonsDelta = 0

    switch (action) {
      case 'lesson':
        scoreDelta = 10
        completedLessonsDelta = 1
        break
      case 'correct_answer':
        scoreDelta = 5
        break
      case 'test_complete':
        scoreDelta = 20
        break
      default:
        return res.status(400).json({ error: 'Неподдерживаемый action' })
    }

    user.score = (user.score || 0) + scoreDelta
    user.completedLessons = (user.completedLessons || 0) + completedLessonsDelta
    await user.save()

    const sanitized = user.toObject()
    delete sanitized.password

    res.json(sanitized)
  } catch (error) {
    console.error('Score update error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
