require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const passport = require('./config/passport')
const User = require('./models/User')

console.log('Environment variables loaded:')
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET')

const PRIMARY_ADMIN_EMAIL = 'sadirov@gmail.com'
const PRIMARY_ADMIN_PASSWORD = 'Admin123!'
const DEMO_EMAILS = [
  'amina.demo@edutc.local',
  'bekzat.demo@edutc.local',
  'diana.demo@edutc.local',
]

const ensurePrimaryAdmin = async () => {
  const password = await bcrypt.hash(PRIMARY_ADMIN_PASSWORD, 10)

  await User.updateOne(
    { email: PRIMARY_ADMIN_EMAIL },
    {
      $set: {
        name: 'Abdulloh Sadirov',
        email: PRIMARY_ADMIN_EMAIL,
        password,
        role: 'admin',
        provider: 'email',
        mentorScope: null,
      },
      $setOnInsert: {
        score: 180,
        completedLessons: 14,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  )
}

const removeDemoUsers = async () => {
  await User.deleteMany({ email: { $in: DEMO_EMAILS } })
}

// Routes
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const aiRoutes = require('./routes/ai')
const leaderboardRoutes = require('./routes/leaderboard')
const coursesRoutes = require('./routes/courses')

const app = express()
const PORT = process.env.PORT || 5002
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)
const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true

  try {
    const parsedOrigin = new URL(origin)
    return parsedOrigin.hostname.endsWith('.vercel.app')
  } catch (error) {
    return false
  }
}

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Session для Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edutc')
.then(async () => {
  console.log('MongoDB connected')
  await ensurePrimaryAdmin()
  await removeDemoUsers()
  console.log('Primary admin is ready and demo users are removed')
})
.catch(err => console.error('MongoDB connection error:', err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api', coursesRoutes)
app.use('/api', leaderboardRoutes)

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Неверный формат email' })
  }

  try {
    // Configure nodemailer (you'll need to set up your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    })

    const mailOptions = {
      from: email,
      to: 'admin@edutc.com', // your admin email
      subject: `Новое сообщение от ${name}`,
      html: `
        <h3>Новое сообщение с сайта EduTC</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Сообщение:</strong></p>
        <p>${message}</p>
      `
    }

    await transporter.sendMail(mailOptions)

    res.json({ message: 'Сообщение отправлено успешно' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ error: 'Ошибка при отправке сообщения' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EduTC Backend is running' })
})

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

server.on('error', (error) => {
  console.error('Server startup error:', error)
})
