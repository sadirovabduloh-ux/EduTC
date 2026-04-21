import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const LanguagesPage = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoading(true)
        const response = await api.get('/courses', { params: { category: 'language' } })
        setCourses(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Failed to load language courses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLanguages()
  }, [])

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Языки
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-600 dark:text-gray-300 sm:text-lg md:text-xl">
            Выберите язык и начните обучение или проверку знаний.
          </p>
        </motion.div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-xl text-gray-700 dark:text-gray-300">Загрузка языков...</div>
          </div>
        ) : courses.length ? (
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 md:gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -10 }}
                className="card group h-full cursor-pointer"
              >
                <Link to={`/language/${course.courseKey}`} className="block h-full">
                  <div className="text-center h-full flex flex-col">
                    <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl">
                      {course.icon || '📚'}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                      {course.description}
                    </p>
                    <div className="mt-6">
                      <span className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg group-hover:bg-primary-600 transition-colors">
                        Открыть язык
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Языковые курсы пока не добавлены
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Добавьте языки через админпанель, и они появятся здесь.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default LanguagesPage
