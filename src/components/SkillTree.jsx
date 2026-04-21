import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import SkillNode from './SkillNode'
import LessonPage from './LessonPage'

const SkillTree = ({ direction, lessons, onBack }) => {
  const safeLessons = Array.isArray(lessons) ? lessons : []
  const [progress, setProgress] = useState({})
  const [currentLesson, setCurrentLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(new Set())

  // Загрузка прогресса из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`it-progress-${direction}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setCompletedLessons(new Set(parsed.completed || []))
      setProgress(parsed.progress || {})
    }
  }, [direction])

  // Сохранение прогресса
  const saveProgress = (completed, prog) => {
    const data = { completed: Array.from(completed), progress: prog }
    localStorage.setItem(`it-progress-${direction}`, JSON.stringify(data))
  }

  const { updateScore } = useAuth()

  const handleLessonComplete = async (lessonId) => {
    const newCompleted = new Set(completedLessons)
    newCompleted.add(lessonId)
    setCompletedLessons(newCompleted)

    const newProgress = { ...progress, [lessonId]: 100 }
    setProgress(newProgress)
    saveProgress(newCompleted, newProgress)

    setCurrentLesson(null)

    await updateScore('lesson').catch(() => {})
  }

  const getNodePosition = (index, total) => {
    const centerX = 400
    const startY = 100
    const spacing = 120

    return {
      x: centerX,
      y: startY + index * spacing,
      index
    }
  }

  const isLessonLocked = (index) => {
    if (index === 0) return false
    return !completedLessons.has(safeLessons[index - 1].id)
  }

  const isLessonCompleted = (lessonId) => completedLessons.has(lessonId)
  const isLessonCurrent = (index) => {
    if (completedLessons.size === 0) return index === 0
    const lastCompletedIndex = safeLessons.findIndex((lesson) => !completedLessons.has(lesson.id))
    return index === (lastCompletedIndex === -1 ? safeLessons.length - 1 : lastCompletedIndex)
  }

  if (currentLesson) {
    return (
      <LessonPage
        lesson={currentLesson}
        onComplete={handleLessonComplete}
        onBack={() => setCurrentLesson(null)}
      />
    )
  }

  if (safeLessons.length === 0) {
    return (
      <div className="card text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Уроки скоро появятся
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Для этого направления пока нет доступных уроков. Выберите другое направление или вернитесь позже.
        </p>
        <button onClick={onBack} className="btn btn-primary">
          Назад к направлениям
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Фон с линиями */}
      <svg className="absolute inset-0 w-full h-full" style={{ height: safeLessons.length * 120 + 200 }}>
        {safeLessons.map((_, index) => {
          if (index === 0) return null
          const prevPos = getNodePosition(index - 1, safeLessons.length)
          const currPos = getNodePosition(index, safeLessons.length)

          return (
            <motion.line
              key={index}
              x1={prevPos.x}
              y1={prevPos.y}
              x2={currPos.x}
              y2={currPos.y}
              stroke={isLessonCompleted(safeLessons[index].id) ? '#10B981' : '#6B7280'}
              strokeWidth="3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isLessonCompleted(safeLessons[index].id) ? 1 : 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          )
        })}
      </svg>

      {/* Узлы */}
      {safeLessons.map((lesson, index) => (
        <SkillNode
          key={lesson.id}
          lesson={lesson}
          isCompleted={isLessonCompleted(lesson.id)}
          isLocked={isLessonLocked(index)}
          isCurrent={isLessonCurrent(index)}
          position={getNodePosition(index, safeLessons.length)}
          onClick={() => !isLessonLocked(index) && setCurrentLesson(lesson)}
        />
      ))}

      {/* Информация о уроках */}
      <div className="mt-8 space-y-4">
        {safeLessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${
              isLessonCompleted(lesson.id)
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : isLessonLocked(index)
                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                : isLessonCurrent(index)
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {index + 1}. {lesson.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {lesson.description}
                </p>
              </div>
              <div className="text-2xl">
                {isLessonCompleted(lesson.id) ? '✅' : isLessonLocked(index) ? '🔒' : '📚'}
              </div>
            </div>
            {isLessonCompleted(lesson.id) && (
              <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                ✓ Пройдено
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Прогресс */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Прогресс обучения
        </h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <motion.div
            className="bg-primary-500 h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(completedLessons.size / safeLessons.length) * 100}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {completedLessons.size} из {safeLessons.length} уроков пройдено
        </p>
      </motion.div>
    </div>
  )
}

export default SkillTree
