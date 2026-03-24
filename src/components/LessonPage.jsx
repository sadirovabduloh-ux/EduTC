import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const LessonPage = ({ lesson, onComplete, onBack }) => {
  const { updateScore } = useAuth()
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [correctScoreAlreadyAdded, setCorrectScoreAlreadyAdded] = useState(false)

  const handleSubmit = async () => {
    let correct = false
    if (lesson.task.type === 'input') {
      correct = userAnswer.toLowerCase().trim() === lesson.task.answer.toLowerCase().trim()
    } else {
      correct = userAnswer === lesson.task.answer
    }

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct && !correctScoreAlreadyAdded) {
      await updateScore('correct_answer').catch(() => {})
      setCorrectScoreAlreadyAdded(true)
    }
  }

  const handleComplete = () => {
    onComplete(lesson.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <button onClick={onBack} className="btn btn-secondary mb-4">
          ← Назад к дереву навыков
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {lesson.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {lesson.description}
        </p>
      </div>

      <div className="space-y-8">
        {/* Объяснение */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Объяснение
          </h2>
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </motion.div>

        {/* Пример */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Пример кода
          </h2>
          <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <code className="text-gray-900 dark:text-gray-100 text-sm">
              {lesson.example}
            </code>
          </pre>
        </motion.div>

        {/* Задание */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Практическое задание
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {lesson.task.question}
          </p>

          {lesson.task.type === 'input' ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                placeholder="Ваш ответ..."
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim() || showFeedback}
                className="btn btn-primary"
              >
                Проверить ответ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {lesson.task.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setUserAnswer(option)
                    setIsCorrect(option === lesson.task.answer)
                    setShowFeedback(true)
                  }}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    showFeedback
                      ? option === lesson.task.answer
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : option === userAnswer
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-500'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-500'
              }`}
            >
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '✅' : '❌'}
                </div>
                <div>
                  <p className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {isCorrect ? 'Правильно!' : 'Неправильно'}
                  </p>
                  {!isCorrect && lesson.task.type === 'input' && (
                    <p className="text-red-600 dark:text-red-400 mt-1">
                      Правильный ответ: <strong>{lesson.task.answer}</strong>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {showFeedback && isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <button onClick={handleComplete} className="btn btn-primary text-lg px-8 py-3">
              Завершить урок
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default LessonPage