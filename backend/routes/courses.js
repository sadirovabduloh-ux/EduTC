const express = require('express')
const Course = require('../models/Course')

const router = express.Router()

router.get('/courses', async (req, res) => {
  try {
    const query = {}

    if (req.query.category) {
      query.category = String(req.query.category).trim().toLowerCase()
    }

    const courses = await Course.find(query).sort({ createdAt: 1, updatedAt: -1 })
    res.json(courses)
  } catch (error) {
    console.error('Public courses fetch error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

router.get('/courses/:courseKey', async (req, res) => {
  try {
    const course = await Course.findOne({
      courseKey: String(req.params.courseKey || '').trim().toLowerCase(),
    })

    if (!course) {
      return res.status(404).json({ error: 'Курс не найден' })
    }

    res.json(course)
  } catch (error) {
    console.error('Public course fetch error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
