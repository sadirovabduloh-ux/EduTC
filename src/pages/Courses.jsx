import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { getEffectiveCourses } from '../lib/localData'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        const response = await api.get('/courses')
        setCourses(getEffectiveCourses(response.data))
      } catch (error) {
        console.error('Failed to load courses:', error)
        setCourses(getEffectiveCourses())
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const hasLanguages = courses.some((course) => course.category === 'language')
  const hasItCourses = courses.some((course) => course.category === 'it')

  const sections = [
    {
      id: 'languages',
      enabled: hasLanguages,
      title: 'Языки',
      icon: '🗣️',
      description: 'Откройте языковое направление, внутри будут Английский, Арабский и Русский.',
      path: '/languages',
      cta: 'Открыть языки',
    },
    {
      id: 'it',
      enabled: hasItCourses,
      title: 'IT',
      icon: '💻',
      description: 'Откройте IT-направления, внутри останутся Frontend, Backend и Database.',
      path: '/it',
      cta: 'Открыть IT',
    },
  ].filter((section) => section.enabled)

  return (
    <section className="px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
            Наши курсы
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 sm:text-lg md:text-xl">
            Выберите направление, которое вас интересует, и начните свой путь к новым знаниям
          </p>
        </motion.div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="text-xl text-gray-700 dark:text-gray-300">Загрузка курсов...</div>
          </div>
        ) : sections.length ? (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 md:gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="card group h-full cursor-pointer"
            >
              <Link to={section.path} className="block h-full">
                <div className="text-center h-full flex flex-col">
                  <div className="mb-4 text-5xl transition-transform duration-300 group-hover:scale-110 sm:text-6xl">
                    {section.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1">
                    {section.description}
                  </p>
                  <div className="mt-6">
                    <span className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg group-hover:bg-primary-600 transition-colors">
                      {section.cta}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        ) : (
          <div className="card text-center py-12">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Разделы пока не добавлены
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Добавьте языковые курсы и IT направления через админпанель, и они появятся здесь.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default Courses
