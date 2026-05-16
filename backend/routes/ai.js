const express = require('express')
const jwt = require('jsonwebtoken')
const OpenAI = require('openai')
const { auth } = require('../middleware/auth')
const User = require('../models/User')
const Course = require('../models/Course')

const router = express.Router()
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null

const courseLabels = {
  english: 'английский',
  arabic: 'арабский',
  russian: 'русский',
  frontend: 'frontend',
  backend: 'backend',
  database: 'database',
}

const normalizeText = (value = '') => String(value).trim().toLowerCase()

const getRequestedCourseKey = (message = '') => {
  const text = normalizeText(message)

  if (text.includes('англ')) return 'english'
  if (text.includes('араб')) return 'arabic'
  if (text.includes('русск')) return 'russian'
  if (text.includes('front')) return 'frontend'
  if (text.includes('back')) return 'backend'
  if (text.includes('data') || text.includes('sql') || text.includes('mongo') || text.includes('база')) {
    return 'database'
  }

  return null
}

const getUserIdFromToken = (req) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    return decoded?.id || null
  } catch (error) {
    return null
  }
}

const getUserSnapshot = async (req) => {
  const userId = getUserIdFromToken(req)
  if (!userId) return null

  try {
    return await User.findById(userId).select('name email role mentorScope score completedLessons progress')
  } catch (error) {
    return null
  }
}

const getCoursesSnapshot = async () => {
  try {
    return await Course.find().select('title description category courseKey lessons technologies')
  } catch (error) {
    return []
  }
}

const getLocalHelpResponse = async (message, req) => {
  const text = normalizeText(message)
  const user = await getUserSnapshot(req)
  const courses = await getCoursesSnapshot()
  const requestedCourseKey = getRequestedCourseKey(text)
  const matchingCourse = requestedCourseKey
    ? courses.find((course) => course.courseKey === requestedCourseKey)
    : null

  if (text.includes('привет') || text.includes('салам') || text.includes('hello')) {
    return `Привет${user?.name ? `, ${user.name}` : ''}! Я помощник EduTC. Могу помочь по курсам, языкам, IT-направлениям, баллам, профилю, сбросу пароля и работе сайта.`
  }

  if (
    text.includes('мой профиль') ||
    text.includes('сколько у меня') ||
    text.includes('мои бал') ||
    text.includes('мой счет') ||
    text.includes('мой счёт')
  ) {
    if (!user) {
      return 'Чтобы я показал твои личные данные, сначала войди в аккаунт. После входа я смогу подсказать баллы, уроки и роль.'
    }

    return `Сейчас у тебя ${user.score || 0} баллов и ${user.completedLessons || 0} завершённых уроков. Роль: ${user.role}.`
  }

  if (text.includes('забыл пароль') || text.includes('сброс') || text.includes('reset password')) {
    return 'Если забыл пароль, открой страницу входа и нажми "Забыли пароль?". Потом введи email, получи ссылку сброса и задай новый пароль.'
  }

  if (text.includes('техподдерж') || text.includes('поддержк') || text.includes('помощь по сайту')) {
    return 'По вопросам сайта открой раздел "Техподдержка". Там можно отправить сообщение с описанием проблемы.'
  }

  if (text.includes('лидер') || text.includes('рейтинг') || text.includes('топ')) {
    return 'В лидерборде пользователи сортируются по баллам и завершённым урокам. Баллы начисляются за правильные ответы, тесты и завершение уроков.'
  }

  if (text.includes('курс') || text.includes('направлен') || text.includes('что есть') || requestedCourseKey) {
    if (matchingCourse) {
      const lessonsCount = matchingCourse.lessons?.length || 0
      const techList = matchingCourse.technologies?.length
        ? ` Технологии: ${matchingCourse.technologies.join(', ')}.`
        : ''

      return `По направлению ${courseLabels[matchingCourse.courseKey] || matchingCourse.courseKey} есть курс "${matchingCourse.title}". В нём ${lessonsCount} уроков.${techList}`
    }

    const languageCourses = courses.filter((course) => course.category === 'language')
    const itCourses = courses.filter((course) => course.category === 'it')

    return `Сейчас на платформе есть ${languageCourses.length} языковых и ${itCourses.length} IT-курсов. Могу отдельно рассказать про английский, арабский, русский, frontend, backend или database.`
  }

  if (text.includes('frontend') || text.includes('html') || text.includes('css')) {
    return 'Во frontend сначала стоит пройти HTML, CSS и JavaScript, потом переходить к React, компонентам, маршрутизации и работе с API.'
  }

  if (text.includes('backend') || text.includes('api') || text.includes('server')) {
    return 'Backend отвечает за сервер, API, маршруты, авторизацию, бизнес-логику и связь с базой данных. Хороший путь: HTTP, Express, middleware, JWT и база данных.'
  }

  if (text.includes('database') || text.includes('sql') || text.includes('mongodb') || text.includes('база')) {
    return 'По базам данных полезно начать с таблиц, ключей, SELECT, JOIN и индексов. Для MongoDB ещё важно понять документы, коллекции и схемы.'
  }

  if (text.includes('javascript') || text.includes('js')) {
    return 'JavaScript нужен для логики интерфейса: переменные, функции, массивы, DOM, события и запросы к API. Если хочешь, могу объяснить любую тему по JS простыми словами.'
  }

  if (text.includes('react')) {
    return 'В React главное понять компоненты, props, state, useEffect и маршрутизацию. После этого уже легче переходить к формам, API и управлению состоянием.'
  }

  return 'Я могу помочь по курсам EduTC, языкам, frontend, backend, database, профилю, баллам, сбросу пароля и работе сайта. Напиши вопрос чуть конкретнее, например: "что есть по frontend", "сколько у меня баллов" или "с чего начать backend".'
}

// AI чат
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Введите сообщение' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ response: await getLocalHelpResponse(message, req) })
    }

    const user = await getUserSnapshot(req)
    const courses = await getCoursesSnapshot()
    const compactCourseContext = courses
      .slice(0, 12)
      .map((course) => {
        const lessonsCount = course.lessons?.length || 0
        return `${course.title} (${course.courseKey}, ${course.category}, ${lessonsCount} уроков)`
      })
      .join('; ')

    const compactUserContext = user
      ? `Пользователь: ${user.name}, роль: ${user.role}, баллы: ${user.score || 0}, уроков: ${user.completedLessons || 0}.`
      : 'Пользователь не авторизован.'

    const systemPrompt = `Ты - AI помощник платформы EduTC.
Отвечай только на русском языке.
Ты помогаешь по обучению, курсам платформы, языкам, IT-направлениям и использованию самого сайта.
Пиши понятно, коротко и по делу.
Если вопрос касается сайта EduTC, отвечай с учетом данных платформы.
${compactUserContext}
Курсы платформы: ${compactCourseContext || 'список курсов сейчас недоступен'}.
${context ? `Дополнительный контекст: ${context}` : ''}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content

    res.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.json({ response: await getLocalHelpResponse(req.body?.message, req) })
  }
})

// Генерация вопросов для теста
router.post('/generate-questions', auth, async (req, res) => {
  try {
    const { topic, level, count = 5 } = req.body

    if (!openai) {
      return res.status(503).json({ error: 'AI генерация недоступна без OPENAI_API_KEY' })
    }

    const prompt = `Создай ${count} вопросов для теста по теме "${topic}" уровня ${level}.
    Каждый вопрос должен иметь 4 варианта ответа, один правильный.
    Верни в формате JSON массива объектов:
    [
      {
        "question": "Текст вопроса",
        "options": ["вариант1", "вариант2", "вариант3", "вариант4"],
        "correct": 0
      }
    ]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content
    const questions = JSON.parse(response)

    res.json({ questions })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Ошибка генерации вопросов' })
  }
})

// Помощь с объяснением
router.post('/explain', auth, async (req, res) => {
  try {
    const { topic, difficulty = 'средний' } = req.body

    if (!openai) {
      return res.status(503).json({ error: 'AI объяснение недоступно без OPENAI_API_KEY' })
    }

    const prompt = `Объясни тему "${topic}" на ${difficulty} уровне сложности.
    Используй понятный язык, примеры. Структура: определение, примеры, практические советы.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.6,
    })

    const explanation = completion.choices[0].message.content

    res.json({ explanation })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Ошибка объяснения' })
  }
})

module.exports = router
