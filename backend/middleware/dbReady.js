const mongoose = require('mongoose')

const requireDbReady = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'База данных пока недоступна. Проверьте локальный MongoDB.' })
  }

  next()
}

module.exports = { requireDbReady }
