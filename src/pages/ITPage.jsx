import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Lesson from '../components/Lesson'
import api from '../lib/api'

const ITPage = () => {
  const [selectedDirection, setSelectedDirection] = useState(null)
  const [directions, setDirections] = useState([])
  const [courseLessons, setCourseLessons] = useState({})
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('select')

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        const response = await api.get('/courses', { params: { category: 'it' } })
        const dbCourses = Array.isArray(response.data) ? response.data : []

        setDirections(
          dbCourses.map((course) => ({
            id: course.courseKey,
            title: course.title,
            icon: course.icon || '📚',
            description: course.description,
            roadmap: course.roadmap || [],
            technologies: course.technologies || [],
          }))
        )

        setCourseLessons(
          dbCourses.reduce((acc, course) => {
            acc[course.courseKey] = (course.lessons || []).map((lesson, index) => ({
              id: lesson.lessonId || `lesson-${index + 1}`,
              title: lesson.title,
              description: lesson.description,
              explanation: lesson.content || lesson.description || '',
              example: lesson.example,
              task: {
                type: lesson.task?.type || 'input',
                question: lesson.task?.question || '',
                answer: lesson.task?.answer || '',
                options: lesson.task?.options || [],
              },
            }))
            return acc
          }, {})
        )
      } catch (error) {
        console.error('Failed to load IT courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const handleOpenDirection = (direction) => {
    setSelectedDirection(direction)
    setMode('lesson')
  }

  const handleBackToDirections = () => {
    setSelectedDirection(null)
    setMode('select')
  }

  const handleLessonComplete = () => {
    setMode('select')
    setSelectedDirection(null)
  }

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            IT Направления
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 dark:text-gray-300 sm:text-lg md:text-xl">
            Выберите специализацию и пройдите интерактивное обучение с системой skill tree
          </p>
        </motion.div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-xl text-gray-700 dark:text-gray-300">Загрузка направлений...</div>
          </div>
        ) : !selectedDirection ? (
          directions.length ? (
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 md:gap-8">
            {directions.map((direction, index) => (
              <motion.div
                key={direction.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="card group cursor-pointer"
                onClick={() => handleOpenDirection(direction)}
              >
                <div className="text-center">
                  <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl">
                    {direction.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {direction.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {direction.description}
                  </p>
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-lg inline-block group-hover:bg-primary-600 transition-colors">
                    Начать обучение
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          ) : (
            <div className="card text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                IT направления пока не добавлены
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Добавьте курсы Frontend, Backend или Database через админпанель, и они появятся здесь.
              </p>
            </div>
          )
        ) : mode === 'lesson' ? (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={handleBackToDirections}
                className="btn btn-secondary w-full sm:w-auto"
              >
                ← Назад к направлениям
              </button>
              <div className="text-center text-4xl sm:text-right">{selectedDirection.icon}</div>
            </div>

            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                {selectedDirection.title}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-300 sm:text-lg">
                {selectedDirection.description}
              </p>
            </div>

            <Lesson
              lessons={courseLessons[selectedDirection.id]}
              onComplete={handleLessonComplete}
            />
          </motion.div>
        ) : null}
      </div>
    </section>
  )
}

export default ITPage
