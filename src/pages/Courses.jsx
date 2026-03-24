import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const courses = [
  {
    id: 'english',
    title: 'Английский',
    icon: '🇬🇧',
    description: 'Изучите английский язык с носителями и профессиональными преподавателями',
    path: '/language/english'
  },
  {
    id: 'arabic',
    title: 'Арабский',
    icon: '🇸🇦',
    description: 'Освойте арабский язык с акцентом на современную разговорную речь',
    path: '/language/arabic'
  },
  {
    id: 'russian',
    title: 'Русский',
    icon: '🇷🇺',
    description: 'Улучшите навыки русского языка для академических и профессиональных целей',
    path: '/language/russian'
  },
  {
    id: 'it',
    title: 'IT',
    icon: '💻',
    description: 'Погрузитесь в мир технологий с курсами по программированию и разработке',
    path: '/it'
  }
]

const Courses = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Наши курсы
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Выберите направление, которое вас интересует, и начните свой путь к новым знаниям
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="card group cursor-pointer"
            >
              <Link to={course.path} className="block h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {course.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="mt-6">
                    <span className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg group-hover:bg-primary-600 transition-colors">
                      Подробнее
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Courses