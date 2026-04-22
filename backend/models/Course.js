const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['language', 'it']
  },
  courseKey: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  icon: {
    type: String,
    default: '📚'
  },
  roadmap: [{
    type: String,
    trim: true
  }],
  technologies: [{
    type: String,
    trim: true
  }],
  lessons: [{
    lessonId: {
      type: String,
      trim: true
    },
    title: String,
    description: String,
    content: String,
    example: String,
    task: {
      type: {
        type: String,
        enum: ['input', 'multiple']
      },
      question: String,
      answer: String,
      options: [String]
    }
  }],
  quiz: [{
    question: {
      type: String,
      trim: true
    },
    options: [{
      type: String,
      trim: true
    }],
    correctIndex: {
      type: Number,
      default: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Course', courseSchema)
