const mongoose = require('mongoose')

const mentorScopes = ['english', 'arabic', 'russian', 'frontend', 'backend', 'database']

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'email'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'mentor'],
    default: 'user'
  },
  mentorScope: {
    type: String,
    enum: [...mentorScopes, null],
    default: null
  },
  provider: {
    type: String,
    enum: ['google', 'email', 'apple'],
    default: 'email'
  },
  googleId: String,
  avatar: String,
  score: {
    type: Number,
    default: 0
  },
  completedLessons: {
    type: Number,
    default: 0
  },
  progress: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', userSchema)
