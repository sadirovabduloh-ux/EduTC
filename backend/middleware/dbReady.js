const mongoose = require('mongoose')

const requireDbReady = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'База данных временно недоступна. Попробуйте снова через пару минут.' })
  }

  next()
}

module.exports = { requireDbReady }
