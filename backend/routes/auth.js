const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const User = require('../models/User')
const { requireDbReady } = require('../middleware/dbReady')

const router = express.Router()

const isConfigured = (value) => Boolean(value && !String(value).includes('your-'))

const getProvidersConfig = () => ({
  google: isConfigured(process.env.GOOGLE_CLIENT_ID) && isConfigured(process.env.GOOGLE_CLIENT_SECRET),
  apple:
    isConfigured(process.env.APPLE_CLIENT_ID) &&
    isConfigured(process.env.APPLE_TEAM_ID) &&
    isConfigured(process.env.APPLE_KEY_ID) &&
    isConfigured(process.env.APPLE_PRIVATE_KEY),
})

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  mentorScope: user.mentorScope || null,
  provider: user.provider,
  avatar: user.avatar,
  score: user.score || 0,
  completedLessons: user.completedLessons || 0,
  createdAt: user.createdAt,
})

router.get('/providers', (req, res) => {
  res.json(getProvidersConfig())
})

// Регистрация
router.post('/register', requireDbReady, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Все поля обязательны для заполнения' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' })
    }

    // Проверка существования пользователя
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' })
    }

    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создание пользователя
    const user = new User({
      name,
      email,
      password: hashedPassword,
      provider: 'email'
    })

    await user.save()

    // Создание JWT токена
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user: sanitizeUser(user),
      token
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Вход
router.post('/login', requireDbReady, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' })
    }

    // Поиск пользователя
    const user = await User.findOne({ email })
    if (!user || user.provider !== 'email') {
      return res.status(401).json({ error: 'Неверные учетные данные' })
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' })
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    res.json({
      user: sanitizeUser(user),
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

// Google OAuth
router.get('/google',
  (req, res, next) => {
    if (!getProvidersConfig().google) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5175'}/login?error=google_not_configured`)
    }
    next()
  },
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  requireDbReady,
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email, role: req.user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      )

      // Перенаправление с токеном
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5175'}/auth/callback?token=${token}`)
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5175'}/login?error=auth_failed`)
    }
  }
)

router.get('/apple', (req, res) => {
  if (!getProvidersConfig().apple) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5175'}/login?error=apple_not_configured`)
  }

  return res.status(501).json({ error: 'Apple Sign In требует серверные ключи и стратегию авторизации' })
})

// Получение профиля
router.get('/profile', require('../middleware/auth').auth, requireDbReady, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }
    res.json(sanitizeUser(user))
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

module.exports = router
