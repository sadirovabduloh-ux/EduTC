const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Требуется авторизация' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' })
  }
}

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ запрещен' })
  }
  next()
}

const staffAuth = (req, res, next) => {
  if (!['admin', 'mentor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Доступ разрешен только администраторам и менторам' })
  }
  next()
}

module.exports = { auth, adminAuth, staffAuth }
