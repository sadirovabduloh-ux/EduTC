import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Quiz = ({ questions, onComplete, onStartLesson }) => {
  const { updateScore } = useAuth()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1)
      updateScore('correct_answer').catch(() => {})
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
        updateScore('test_complete').catch(() => {})
      }
    }, 1000)
  }

  const getLevel = (score) => {
    if (score <= 3) return 'A1'
    if (score <= 6) return 'A2'
    if (score <= 8) return 'B1'
    return 'B2'
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setShowResult(false)
    setSelectedAnswer(null)
  }

  if (showResult) {
    const level = getLevel(score)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Результаты теста
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
          Ваш уровень: <span className="font-bold text-primary-600">{level}</span>
        </p>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Правильных ответов: {score} из {questions.length}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={resetQuiz} className="btn btn-secondary">
            Пройти ещё раз
          </button>
          <button onClick={onStartLesson} className="btn btn-primary">
            Начать обучение
          </button>
          <button onClick={onComplete} className="btn btn-outline">
            Назад к выбору
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={currentQuestion}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="card max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Проверка знаний
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Вопрос {currentQuestion + 1} из {questions.length}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {questions[currentQuestion].question}
        </h3>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg border transition-all ${
                selectedAnswer === null
                  ? 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  : selectedAnswer === index
                  ? index === questions[currentQuestion].correct
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : index === questions[currentQuestion].correct
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Quiz