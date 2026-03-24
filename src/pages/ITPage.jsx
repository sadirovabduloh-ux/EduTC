import { useState } from 'react'
import { motion } from 'framer-motion'
import SkillTree from '../components/SkillTree'
import { itLessons } from '../data/itLessons'

const itDirections = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: '💻',
    description: 'Создание пользовательских интерфейсов',
    roadmap: [
      'HTML & CSS Basics',
      'JavaScript Fundamentals',
      'React.js',
      'State Management (Redux/Zustand)',
      'CSS Frameworks (Tailwind)',
      'Build Tools (Vite/Webpack)',
      'Testing (Jest/React Testing Library)',
      'Performance Optimization'
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Sass']
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: '⚙️',
    description: 'Серверная разработка и API',
    roadmap: [
      'Programming Fundamentals',
      'Database Design',
      'RESTful APIs',
      'Authentication & Security',
      'Node.js & Express',
      'Database Management',
      'Caching & Performance',
      'Deployment & DevOps'
    ],
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'GraphQL']
  },
  {
    id: 'database',
    title: 'Database',
    icon: '🗄️',
    description: 'Проектирование и управление базами данных',
    roadmap: [
      'SQL Fundamentals',
      'Database Design',
      'Normalization',
      'Indexing & Optimization',
      'NoSQL Databases',
      'Data Modeling',
      'Backup & Recovery',
      'Security & Permissions'
    ],
    technologies: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Firebase', 'Prisma']
  }
]

const ITPage = () => {
  const [selectedDirection, setSelectedDirection] = useState(null)

  return (
    <section className="min-h-screen py-20 px-4 pt-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            IT Направления
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Выберите специализацию и пройдите интерактивное обучение с системой skill tree
          </p>
        </motion.div>

        {!selectedDirection ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itDirections.map((direction, index) => (
              <motion.div
                key={direction.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="card cursor-pointer group"
                onClick={() => setSelectedDirection(direction)}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {direction.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
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
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedDirection(null)}
                className="btn btn-secondary"
              >
                ← Назад к направлениям
              </button>
              <div className="text-4xl">{selectedDirection.icon}</div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedDirection.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {selectedDirection.description}
              </p>
            </div>

            <SkillTree
              direction={selectedDirection.id}
              lessons={itLessons[selectedDirection.id]}
              onBack={() => setSelectedDirection(null)}
            />
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default ITPage