import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Lesson = ({ lessons, onComplete, directionKey }) => {
  const [currentLesson, setCurrentLesson] = useState(0)
  const [progress, setProgress] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const { updateScore, recordLessonProgress } = useAuth()

  const lesson = lessons[currentLesson]

  const handleSubmit = () => {
    const correct = userAnswer.toLowerCase().trim() === lesson.task.answer.toLowerCase().trim()
    setIsCorrect(correct)
    setShowFeedback(true)
  }

  const nextLesson = async () => {
    const lessonId = lesson.id || `${directionKey || 'lesson'}-${currentLesson + 1}`
    recordLessonProgress(directionKey || 'general', lessonId)
    await updateScore('lesson').catch(() => {})

    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1)
      setProgress(((currentLesson + 1) / lessons.length) * 100)
      setUserAnswer('')
      setShowFeedback(false)
    } else {
      onComplete()
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="mb-2 flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300 sm:flex-row sm:justify-between">
          <span>Урок {currentLesson + 1} из {lessons.length}</span>
          <span>{Math.round(progress)}% завершено</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-primary-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <motion.div
        key={currentLesson}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card px-4 py-5 sm:px-6 sm:py-6"
      >
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {lesson.title}
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Объяснение
            </h3>
            <div
              className="text-gray-600 dark:text-gray-300 leading-relaxed [&_p]:mb-3 last:[&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: lesson.explanation || '' }}
            />
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Пример
            </h3>
            <div className="overflow-x-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <p className="font-mono text-sm text-gray-900 dark:text-white sm:text-base">
                {lesson.example}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
              Задание
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
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
                  disabled={!userAnswer.trim()}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Проверить
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
                    className="w-full p-4 text-left rounded-lg border border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
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
                className={`mt-4 p-4 rounded-lg ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-500'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-500'
                }`}
              >
                <p className={`font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isCorrect ? 'Правильно!' : 'Неправильно. Правильный ответ: ' + lesson.task.answer}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {showFeedback && (
          <div className="mt-8 flex justify-end">
            <button onClick={nextLesson} className="btn btn-primary w-full sm:w-auto">
              {currentLesson < lessons.length - 1 ? 'Следующий урок' : 'Завершить обучение'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Lesson
