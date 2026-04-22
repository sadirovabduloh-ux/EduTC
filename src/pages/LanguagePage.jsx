import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Quiz from '../components/Quiz'
import Lesson from '../components/Lesson'
import api from '../lib/api'
import { getEffectiveCourseByKey } from '../lib/localData'

const LanguagePage = () => {
  const { lang } = useParams()
  const [mode, setMode] = useState('select') // 'select', 'quiz', 'lesson'
  const [languageCourse, setLanguageCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/courses/${lang}`)
        setLanguageCourse(getEffectiveCourseByKey(lang, response.data))
      } catch (error) {
        console.error('Failed to load language course:', error)
        setLanguageCourse(getEffectiveCourseByKey(lang))
      } finally {
        setLoading(false)
      }
    }

    if (lang) {
      loadCourse()
    }
  }, [lang])

  const language = languageCourse
    ? {
        name: languageCourse.title,
        flag: languageCourse.icon || '📚',
        quiz: (languageCourse.quiz || []).map((item) => ({
          question: item.question,
          options: item.options || [],
          correct: Number.isInteger(item.correctIndex) ? item.correctIndex : 0,
        })),
        lessons: (languageCourse.lessons || []).map((lesson) => ({
          title: lesson.title,
          explanation: lesson.content || lesson.description || '',
          example: lesson.example,
          task: {
            type: lesson.task?.type || 'input',
            question: lesson.task?.question || '',
            answer: lesson.task?.answer || '',
            options: lesson.task?.options || [],
          },
        })),
      }
    : null

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  if (!language) {
    return <div className="min-h-screen flex items-center justify-center">Курс не найден</div>
  }

  const handleStartQuiz = () => setMode('quiz')
  const handleStartLesson = () => setMode('lesson')
  const handleBackToSelect = () => setMode('select')
  const handleLessonComplete = () => setMode('select')

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center sm:mb-12"
        >
          <div className="mb-4 text-5xl sm:text-6xl">{language.flag}</div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            {language.name}
          </h1>
        </motion.div>

        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card mx-auto max-w-2xl text-center"
          >
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Выберите действие
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleStartQuiz}
                className="btn btn-primary w-full py-4 text-base sm:text-lg"
              >
                ✅ Проверить знания
              </button>
              <button
                onClick={handleStartLesson}
                className="btn btn-secondary w-full py-4 text-base sm:text-lg"
              >
                🎓 Начать обучение
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'quiz' && (
          <Quiz
            questions={language.quiz}
            onComplete={handleBackToSelect}
            onStartLesson={handleStartLesson}
          />
        )}

        {mode === 'lesson' && (
          <Lesson
            lessons={language.lessons}
            onComplete={handleLessonComplete}
          />
        )}
      </div>
    </section>
  )
}

export default LanguagePage
