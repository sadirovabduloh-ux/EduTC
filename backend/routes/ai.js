const express = require('express')
const OpenAI = require('openai')
const { auth } = require('../middleware/auth')

const router = express.Router()
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null

const getLocalHelpResponse = (message) => {
  const text = String(message || '').toLowerCase()

  if (text.includes('html') || text.includes('css') || text.includes('frontend')) {
    return 'Во frontend сначала стоит пройти HTML, CSS и JavaScript, а затем перейти к React и работе с компонентами. Если хочешь, напиши конкретную тему, и я объясню её простыми словами.'
  }

  if (text.includes('backend') || text.includes('api') || text.includes('server')) {
    return 'Backend отвечает за сервер, маршруты, бизнес-логику, авторизацию и работу с базой данных. Хорошая последовательность изучения: HTTP, Express, маршруты, middleware, база данных, JWT и обработка ошибок.'
  }

  if (text.includes('database') || text.includes('sql') || text.includes('mongodb')) {
    return 'По базам данных полезно начать с таблиц, ключей, SELECT, JOIN, индексов и нормализации. Если работаешь с MongoDB, дополнительно стоит понять коллекции, документы и схемы.'
  }

  if (text.includes('javascript') || text.includes('js')) {
    return 'JavaScript нужен для интерактивности: события, работа с DOM, запросы к API и логика интерфейса. Если хочешь, я могу объяснить `let`, функции, массивы или `async/await`.'
  }

  if (text.includes('react')) {
    return 'В React главное понять компоненты, props, state, `useEffect` и маршрутизацию. После этого уже легче переходить к формам, API-запросам и управлению состоянием.'
  }

  return 'Я могу помочь с обучением по HTML, CSS, JavaScript, React, backend, API и базам данных. Напиши тему или вопрос, например: "объясни JWT", "что такое JOIN" или "с чего начать backend".'
}

// AI чат
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Введите сообщение' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({ response: getLocalHelpResponse(message) })
    }

    const systemPrompt = `Ты - AI помощник образовательной платформы EduTC.
    Ты помогаешь пользователям с обучением языкам и IT технологиям.
    Отвечай на русском языке, будь полезным и дружелюбным.
    Если вопрос касается программирования или языков, объясняй понятно.
    ${context ? `Контекст: ${context}` : ''}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    })

    const response = completion.choices[0].message.content

    res.json({ response })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.json({ response: getLocalHelpResponse(req.body?.message) })
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
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
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
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.6
    })

    const explanation = completion.choices[0].message.content

    res.json({ explanation })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Ошибка объяснения' })
  }
})

module.exports = router
