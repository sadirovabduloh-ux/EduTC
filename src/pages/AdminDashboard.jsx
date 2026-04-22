import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  buildLocalStats,
  getLocalCourses,
  getLocalUsers,
  isLocalToken,
  saveLocalCourses,
  saveLocalUsers,
} from '../lib/localData'

const mentorScopeOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'english', label: 'Английский' },
  { value: 'arabic', label: 'Арабский' },
  { value: 'russian', label: 'Русский' },
]
const defaultMentorScope = mentorScopeOptions[0].value
const blankLesson = (index = 1) => ({
  lessonId: `lesson-${index}`,
  title: '',
  description: '',
  content: '',
  example: '',
  task: {
    type: 'input',
    question: '',
    answer: '',
    options: ['', '', ''],
  },
})

const normalizeLesson = (lesson = {}, index = 0) => ({
  lessonId: lesson.lessonId || `lesson-${index + 1}`,
  title: lesson.title || '',
  description: lesson.description || '',
  content: lesson.content || '',
  example: lesson.example || '',
  task: {
    type: lesson.task?.type || 'input',
    question: lesson.task?.question || '',
    answer: lesson.task?.answer || '',
    options: lesson.task?.options?.length ? lesson.task.options : ['', '', ''],
  },
})

const LessonFields = ({ lesson, onLessonChange, onTaskChange, onOptionChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        value={lesson.lessonId}
        onChange={(e) => onLessonChange({ lessonId: e.target.value })}
        placeholder="lesson-id"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
      <input
        type="text"
        value={lesson.title}
        onChange={(e) => onLessonChange({ title: e.target.value })}
        placeholder="Название урока"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    <textarea
      value={lesson.description}
      onChange={(e) => onLessonChange({ description: e.target.value })}
      placeholder="Краткое описание урока"
      rows={2}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />

    <textarea
      value={lesson.content}
      onChange={(e) => onLessonChange({ content: e.target.value })}
      placeholder="Текст урока"
      rows={4}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />

    <textarea
      value={lesson.example}
      onChange={(e) => onLessonChange({ example: e.target.value })}
      placeholder="Пример"
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        value={lesson.task.type}
        onChange={(e) => onTaskChange({ type: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        <option value="input">Свободный ответ</option>
        <option value="multiple">Варианты ответа</option>
      </select>

      <input
        type="text"
        value={lesson.task.answer}
        onChange={(e) => onTaskChange({ answer: e.target.value })}
        placeholder="Правильный ответ"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      />
    </div>

    <textarea
      value={lesson.task.question}
      onChange={(e) => onTaskChange({ question: e.target.value })}
      placeholder="Вопрос к уроку"
      rows={2}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
    />

    {lesson.task.type === 'multiple' && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {lesson.task.options.map((option, optionIndex) => (
          <input
            key={`${lesson.lessonId}-option-${optionIndex}`}
            type="text"
            value={option}
            onChange={(e) => onOptionChange(optionIndex, e.target.value)}
            placeholder={`Вариант ${optionIndex + 1}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        ))}
      </div>
    )}
  </div>
)

const blankQuizItem = () => ({
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
})

const AdminDashboard = () => {
  const { user, token, isAdmin, isMentor } = useAuth()
  const mentorScope = user?.mentorScope || ''
  const [activeTab, setActiveTab] = useState('courses')
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedEditableExistingCourseId, setSelectedEditableExistingCourseId] = useState('')
  const availableTabs = useMemo(() => {
    if (isAdmin) {
      return [
        { id: 'courses', label: 'Курсы' },
        { id: 'users', label: 'Пользователи' },
      ]
    }

    return [{ id: 'courses', label: 'Мои курсы' }]
  }, [isAdmin])

  useEffect(() => {
    loadData()
  }, [isAdmin])

  const getScopedCourses = (items) => {
    if (isAdmin) return items
    return items.filter((course) => course.courseKey === mentorScope)
  }

  const loadData = async () => {
    try {
      setLoading(true)

      const requests = [api.get('/admin/courses'), api.get('/admin/stats')]
      if (isAdmin) {
        requests.push(api.get('/admin/users'))
      }

      const [coursesRes, statsRes, usersRes] = await Promise.all(requests)
      setCourses(coursesRes.data)
      setStats(statsRes.data)
      setUsers(usersRes?.data || [])
    } catch (error) {
      console.error('Failed to load admin data:', error)
      const localUsers = getLocalUsers().map(({ password, ...member }) => member)
      const localCourses = getLocalCourses()
      setCourses(getScopedCourses(localCourses))
      setUsers(localUsers)
      setStats(buildLocalStats(localUsers, localCourses, mentorScope))
    } finally {
      setLoading(false)
    }
  }

  const upsertCourse = (savedCourse) => {
    setCourses((prev) => {
      const exists = prev.some((course) => course._id === savedCourse._id)
      if (!exists) return [savedCourse, ...prev]
      return prev.map((course) => (course._id === savedCourse._id ? savedCourse : course))
    })
    setSelectedEditableExistingCourseId(savedCourse._id)
  }

  const handleDeleteCourse = async (id) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return

    try {
      await api.delete(`/admin/courses/${id}`)
      setCourses((prev) => prev.filter((course) => course._id !== id))
    } catch (error) {
      console.error('Failed to delete course:', error)
      if (!error.response || isLocalToken(token)) {
        const nextCourses = getLocalCourses().filter((course) => course._id !== id)
        saveLocalCourses(nextCourses)
        setCourses(getScopedCourses(nextCourses))
        setStats((prev) => ({ ...prev, totalCourses: nextCourses.length }))
        return
      }
      alert(error.response?.data?.error || 'Не удалось удалить курс')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Удалить этого участника?')) return

    try {
      await api.delete(`/admin/users/${userId}`)
      setUsers((prev) => prev.filter((member) => member._id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
      if (!error.response || isLocalToken(token)) {
        const nextUsers = getLocalUsers().filter((member) => member._id !== userId)
        saveLocalUsers(nextUsers)
        const sanitized = nextUsers.map(({ password, ...member }) => member)
        setUsers(sanitized)
        setStats((prev) => ({ ...prev, totalUsers: sanitized.length }))
        return
      }
      alert(error.response?.data?.error || 'Не удалось удалить пользователя')
    }
  }

  const handleUpdateRole = async (userId, nextRole, nextMentorScope) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, {
        role: nextRole,
        mentorScope: nextRole === 'mentor' ? nextMentorScope : null,
      })

      setUsers((prev) =>
        prev.map((member) => (member._id === userId ? response.data : member))
      )
    } catch (error) {
      console.error('Failed to update user role:', error)
      if (!error.response || isLocalToken(token)) {
        const nextUsers = getLocalUsers().map((member) =>
          member._id === userId
            ? {
                ...member,
                role: nextRole,
                mentorScope: nextRole === 'mentor' ? nextMentorScope : null,
              }
            : member
        )
        saveLocalUsers(nextUsers)
        const sanitized = nextUsers.map(({ password, ...member }) => member)
        setUsers(sanitized)
        setStats((prev) => ({
          ...prev,
          mentorUsers: sanitized.filter((member) => member.role === 'mentor').length,
        }))
        return
      }
      alert(error.response?.data?.error || 'Не удалось обновить роль')
    }
  }

  const handleSaveCourse = async (courseData) => {
    try {
      const response = editingCourse?._id
        ? await api.put(`/admin/courses/${editingCourse._id}`, courseData)
        : await api.post('/admin/courses', courseData)

      upsertCourse(response.data)
      setEditingCourse(null)
    } catch (error) {
      console.error('Failed to save course:', error)
      if (!error.response || isLocalToken(token)) {
        const allCourses = getLocalCourses()
        const normalizedCourse = {
          ...courseData,
          _id: editingCourse?._id || `local-course-${Date.now()}`,
          lessons: courseData.lessons || [],
          quiz: courseData.quiz || [],
        }
        const nextCourses = editingCourse?._id
          ? allCourses.map((course) => (course._id === editingCourse._id ? normalizedCourse : course))
          : [normalizedCourse, ...allCourses]

        saveLocalCourses(nextCourses)
        upsertCourse(normalizedCourse)
        setStats((prev) => ({ ...prev, totalCourses: nextCourses.length }))
        setEditingCourse(null)
        return
      }
      alert(error.response?.data?.error || 'Не удалось сохранить курс')
    }
  }

  const handleOpenExistingCourseEditor = () => {
    if (!selectedEditableExistingCourseId) return

    const selectedCourse = courses.find((course) => course._id === selectedEditableExistingCourseId)
    if (!selectedCourse) return

    setEditingCourse(selectedCourse)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  return (
    <section className="min-h-screen px-4 py-16 pt-28 sm:py-20 sm:pt-32">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {isAdmin ? 'Админ панель' : 'Панель ментора'}
          </h1>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {isAdmin
                  ? stats.totalUsers ?? 0
                  : mentorScopeOptions.find((item) => item.value === mentorScope)?.label || mentorScope}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {isAdmin ? 'Пользователей' : 'Направление ментора'}
              </div>
            </div>

            <div className="card text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalCourses ?? 0}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {isAdmin ? 'Курсов' : 'Курсов в вашем направлении'}
              </div>
            </div>

            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {isAdmin ? stats.mentorUsers ?? 0 : courses.length}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                {isAdmin ? 'Менторов' : 'Доступных курсов'}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition-colors sm:flex-1 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'courses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isAdmin ? 'Управление курсами' : 'Управление курсами ментора'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {isAdmin
                  ? 'Здесь можно создавать новые курсы и редактировать уже существующие вместе с их уроками.'
                  : `Ментор может добавлять и редактировать курсы только по направлению: ${
                      mentorScopeOptions.find((item) => item.value === mentorScope)?.label || mentorScope
                    }.`}
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Редактировать курс</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Выберите уже созданный курс и откройте полное редактирование курса и его уроков.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={selectedEditableExistingCourseId}
                      onChange={(e) => setSelectedEditableExistingCourseId(e.target.value)}
                      disabled={!courses.length}
                      className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
                    >
                      <option value="">
                        {courses.length ? 'Выберите курс' : 'Сначала создайте курс'}
                      </option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleOpenExistingCourseEditor}
                      disabled={!selectedEditableExistingCourseId}
                      className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Редактировать курс
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Добавить курс</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {isAdmin
                        ? 'Создайте новый курс и сразу заполните его уроки в одной форме.'
                        : `Создайте новый курс в направлении ${
                            mentorScopeOptions.find((item) => item.value === mentorScope)?.label || mentorScope
                          }.`}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCourse(isMentor ? { courseKey: mentorScope } : {})
                    }}
                    className="btn btn-primary"
                  >
                    Добавить курс
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-2xl">{course.icon}</div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {course.description}
                  </p>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                    <div>{course.category} • {course.courseKey}</div>
                    <div>{course.lessons?.length || 0} уроков / вопросов</div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="px-3 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300"
                    >
                      Редактировать курс
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {isAdmin && activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Управление пользователями
            </h2>

            <div className="overflow-x-auto rounded-lg">
              <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Направление
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((member) => (
                    <tr key={member._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {member.avatar && (
                            <img className="h-8 w-8 rounded-full mr-3" src={member.avatar} alt="" />
                          )}
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(
                              member._id,
                              e.target.value,
                              e.target.value === 'mentor'
                                ? member.mentorScope || defaultMentorScope
                                : null
                            )
                          }
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700"
                        >
                          <option value="user">Пользователь</option>
                          <option value="mentor">Ментор</option>
                          <option value="admin">Админ</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={member.mentorScope || ''}
                          disabled={member.role !== 'mentor'}
                          onChange={(e) => handleUpdateRole(member._id, member.role, e.target.value)}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 disabled:opacity-50"
                        >
                          <option value="">Не задано</option>
                          {mentorScopeOptions.map((scope) => (
                            <option key={scope.value} value={scope.value}>
                              {scope.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(member._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {editingCourse && (
          <CourseModal
            course={editingCourse}
            onSave={handleSaveCourse}
            onClose={() => setEditingCourse(null)}
            mentorScope={mentorScope}
            isMentor={isMentor}
          />
        )}
      </div>
    </section>
  )
}

const CourseModal = ({ course, onSave, onClose, mentorScope, isMentor }) => {
  const [formData, setFormData] = useState({
    title: course.title || '',
    description: course.description || '',
    category:
      course.category ||
      (mentorScope && ['frontend', 'backend', 'database'].includes(mentorScope) ? 'it' : 'language'),
    courseKey: course.courseKey || mentorScope || 'frontend',
    icon: course.icon || '📚',
    roadmap: course.roadmap || [],
    technologies: course.technologies || [],
  })
  const [lessons, setLessons] = useState(
    course.lessons?.length ? course.lessons.map((lesson, index) => normalizeLesson(lesson, index)) : [blankLesson()]
  )
  const [quiz, setQuiz] = useState(
    course.quiz?.length
      ? course.quiz.map((item) => ({
          question: item.question || '',
          options: Array.isArray(item.options) && item.options.length ? item.options : ['', '', '', ''],
          correctIndex: Number.isInteger(item.correctIndex) ? item.correctIndex : 0,
        }))
      : []
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...formData,
      lessons: lessons.map((lesson) => ({
        ...lesson,
        task: {
          ...lesson.task,
          options:
            lesson.task.type === 'multiple'
              ? lesson.task.options.map((option) => option.trim()).filter(Boolean)
              : [],
        },
      })),
      quiz: quiz.map((item) => ({
        question: item.question,
        options: item.options.map((option) => option.trim()).filter(Boolean),
        correctIndex: item.correctIndex,
      })),
    })
  }

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    }))
  }

  const updateLesson = (index, patch) => {
    setLessons((prev) =>
      prev.map((lesson, lessonIndex) => (lessonIndex === index ? { ...lesson, ...patch } : lesson))
    )
  }

  const updateLessonTask = (index, patch) => {
    setLessons((prev) =>
      prev.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, task: { ...lesson.task, ...patch } } : lesson
      )
    )
  }

  const updateLessonOption = (lessonIndex, optionIndex, value) => {
    setLessons((prev) =>
      prev.map((lesson, currentIndex) => {
        if (currentIndex !== lessonIndex) return lesson

        const nextOptions = [...lesson.task.options]
        nextOptions[optionIndex] = value

        return {
          ...lesson,
          task: {
            ...lesson.task,
            options: nextOptions,
          },
        }
      })
    )
  }

  const addLesson = () => {
    setLessons((prev) => [...prev, blankLesson(prev.length + 1)])
  }

  const removeLesson = (index) => {
    setLessons((prev) => (prev.length > 1 ? prev.filter((_, lessonIndex) => lessonIndex !== index) : prev))
  }

  const updateQuizItem = (index, patch) => {
    setQuiz((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  const updateQuizOption = (itemIndex, optionIndex, value) => {
    setQuiz((prev) =>
      prev.map((item, currentIndex) => {
        if (currentIndex !== itemIndex) return item

        const nextOptions = [...item.options]
        nextOptions[optionIndex] = value

        return {
          ...item,
          options: nextOptions,
        }
      })
    )
  }

  const addQuizItem = () => {
    setQuiz((prev) => [...prev, blankQuizItem()])
  }

  const removeQuizItem = (index) => {
    setQuiz((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 dark:bg-gray-800"
      >
        <div className="mb-6 flex items-start justify-between gap-3 sm:items-center">
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
            {course._id ? 'Редактировать курс' : 'Добавить курс'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Название
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Иконка
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Категория
              </label>
              <select
                value={formData.category}
                disabled={isMentor}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
              >
                <option value="language">Языки</option>
                <option value="it">IT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Направление / courseKey
              </label>
              <select
                value={formData.courseKey}
                disabled={isMentor}
                onChange={(e) => setFormData((prev) => ({ ...prev, courseKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
              >
                {mentorScopeOptions.map((scope) => (
                  <option key={scope.value} value={scope.value}>
                    {scope.label}
                  </option>
                ))}
              </select>
              {isMentor && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Для ментора направление назначается автоматически.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Roadmap (через запятую)
            </label>
            <input
              type="text"
              value={formData.roadmap.join(', ')}
              onChange={(e) => handleArrayChange('roadmap', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Технологии (через запятую)
            </label>
            <input
              type="text"
              value={formData.technologies.join(', ')}
              onChange={(e) => handleArrayChange('technologies', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Уроки курса
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Здесь можно менять уже готовые пробные уроки и добавлять новые.
                </p>
              </div>

              <button type="button" onClick={addLesson} className="btn btn-primary">
                Добавить урок
              </button>
            </div>

            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <div
                  key={`${lesson.lessonId}-${index}`}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Урок {index + 1}
                    </h5>
                    {lessons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLesson(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Удалить урок
                      </button>
                    )}
                  </div>

                  <LessonFields
                    lesson={lesson}
                    onLessonChange={(patch) => updateLesson(index, patch)}
                    onTaskChange={(patch) => updateLessonTask(index, patch)}
                    onOptionChange={(optionIndex, value) => updateLessonOption(index, optionIndex, value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Вопросы для проверки знаний
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Здесь можно редактировать тестовые вопросы, которые показываются перед обучением.
                </p>
              </div>

              <button type="button" onClick={addQuizItem} className="btn btn-secondary">
                Добавить вопрос
              </button>
            </div>

            {quiz.length ? (
              <div className="space-y-4">
                {quiz.map((item, index) => (
                  <div
                    key={`quiz-${index}`}
                    className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Вопрос {index + 1}
                      </h5>
                      <button
                        type="button"
                        onClick={() => removeQuizItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Удалить вопрос
                      </button>
                    </div>

                    <textarea
                      value={item.question}
                      onChange={(e) => updateQuizItem(index, { question: e.target.value })}
                      placeholder="Текст вопроса"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {item.options.map((option, optionIndex) => (
                        <input
                          key={`quiz-${index}-option-${optionIndex}`}
                          type="text"
                          value={option}
                          onChange={(e) => updateQuizOption(index, optionIndex, e.target.value)}
                          placeholder={`Вариант ${optionIndex + 1}`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Правильный вариант
                      </label>
                      <select
                        value={item.correctIndex}
                        onChange={(e) => updateQuizItem(index, { correctIndex: Number(e.target.value) })}
                        className="w-full md:w-60 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {item.options.map((_, optionIndex) => (
                          <option key={`quiz-correct-${optionIndex}`} value={optionIndex}>
                            Вариант {optionIndex + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                Для этого курса пока нет тестовых вопросов. Их можно добавить кнопкой выше.
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Сохранить курс
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const LessonManagerModal = ({ course, onSave, onClose, initialMode = 'create' }) => {
  const [lessons, setLessons] = useState(
    course.lessons?.length
      ? course.lessons.map((lesson, index) => normalizeLesson(lesson, index))
      : [blankLesson()]
  )
  const [selectedExistingLessonId, setSelectedExistingLessonId] = useState(course.lessons?.[0]?.lessonId || '')
  const [newLessonDraft, setNewLessonDraft] = useState(blankLesson((course.lessons?.length || 0) + 1))
  const [activeLessonPanel, setActiveLessonPanel] = useState(initialMode)

  const existingLessons = course.lessons?.length ? lessons : []
  const selectedExistingLesson =
    existingLessons.find((lesson) => lesson.lessonId === selectedExistingLessonId) || existingLessons[0] || null

  const updateLesson = (index, patch) => {
    setLessons((prev) =>
      prev.map((lesson, lessonIndex) => (lessonIndex === index ? { ...lesson, ...patch } : lesson))
    )
  }

  const updateLessonTask = (index, patch) => {
    setLessons((prev) =>
      prev.map((lesson, lessonIndex) =>
        lessonIndex === index ? { ...lesson, task: { ...lesson.task, ...patch } } : lesson
      )
    )
  }

  const updateLessonOption = (lessonIndex, optionIndex, value) => {
    setLessons((prev) =>
      prev.map((lesson, currentIndex) => {
        if (currentIndex !== lessonIndex) return lesson

        const nextOptions = [...lesson.task.options]
        nextOptions[optionIndex] = value

        return {
          ...lesson,
          task: {
            ...lesson.task,
            options: nextOptions,
          },
        }
      })
    )
  }

  const updateSelectedExistingLesson = (patch) => {
    if (!selectedExistingLesson) return

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.lessonId === selectedExistingLesson.lessonId ? { ...lesson, ...patch } : lesson
      )
    )
  }

  const updateSelectedExistingLessonTask = (patch) => {
    if (!selectedExistingLesson) return

    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.lessonId === selectedExistingLesson.lessonId
          ? { ...lesson, task: { ...lesson.task, ...patch } }
          : lesson
      )
    )
  }

  const updateSelectedExistingLessonOption = (optionIndex, value) => {
    if (!selectedExistingLesson) return

    setLessons((prev) =>
      prev.map((lesson) => {
        if (lesson.lessonId !== selectedExistingLesson.lessonId) return lesson

        const nextOptions = [...lesson.task.options]
        nextOptions[optionIndex] = value

        return {
          ...lesson,
          task: {
            ...lesson.task,
            options: nextOptions,
          },
        }
      })
    )
  }

  const updateNewLesson = (patch) => {
    setNewLessonDraft((prev) => ({ ...prev, ...patch }))
  }

  const updateNewLessonTask = (patch) => {
    setNewLessonDraft((prev) => ({
      ...prev,
      task: { ...prev.task, ...patch },
    }))
  }

  const updateNewLessonOption = (optionIndex, value) => {
    setNewLessonDraft((prev) => {
      const nextOptions = [...prev.task.options]
      nextOptions[optionIndex] = value

      return {
        ...prev,
        task: {
          ...prev.task,
          options: nextOptions,
        },
      }
    })
  }

  const addLesson = () => {
    const lessonToAdd = normalizeLesson(newLessonDraft, lessons.length)

    setLessons((prev) => [...prev, lessonToAdd])
    setSelectedExistingLessonId(lessonToAdd.lessonId)
    setNewLessonDraft(blankLesson(lessons.length + 2))
  }

  const removeLesson = (index) => {
    setLessons((prev) => {
      const nextLessons = prev.filter((_, lessonIndex) => lessonIndex !== index)

      if (selectedExistingLesson && prev[index]?.lessonId === selectedExistingLesson.lessonId) {
        setSelectedExistingLessonId(nextLessons[0]?.lessonId || '')
      }

      return nextLessons.length ? nextLessons : [blankLesson()]
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(
      course._id,
      lessons.map((lesson) => ({
        ...lesson,
        task: {
          ...lesson.task,
          options:
            lesson.task.type === 'multiple'
              ? lesson.task.options.map((option) => option.trim()).filter(Boolean)
              : [],
        },
      }))
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Управление уроками
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Курс: {course.title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveLessonPanel('create')}
              className={`px-4 py-3 rounded-xl border transition-colors ${
                activeLessonPanel === 'create'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              Добавить новые уроки
            </button>
            <button
              type="button"
              onClick={() => setActiveLessonPanel('edit')}
              className={`px-4 py-3 rounded-xl border transition-colors ${
                activeLessonPanel === 'edit'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-200'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              Изменить готовые уроки
            </button>
          </div>

          {activeLessonPanel === 'edit' ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Изменить готовый урок
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Выберите уже созданный урок и измените его содержимое.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedExistingLesson?.lessonId || ''}
                    onChange={(e) => setSelectedExistingLessonId(e.target.value)}
                    disabled={!existingLessons.length}
                    className="min-w-[220px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-60"
                  >
                    {!existingLessons.length && <option value="">Готовых уроков пока нет</option>}
                    {existingLessons.map((lesson, index) => (
                      <option key={`${lesson.lessonId}-${index}`} value={lesson.lessonId}>
                        {lesson.title || `Урок ${index + 1}`}
                      </option>
                    ))}
                  </select>

                  {selectedExistingLesson && lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeLesson(
                          lessons.findIndex((lesson) => lesson.lessonId === selectedExistingLesson.lessonId)
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      Удалить урок
                    </button>
                  )}
                </div>
              </div>

              {selectedExistingLesson ? (
                <LessonFields
                  lesson={selectedExistingLesson}
                  onLessonChange={updateSelectedExistingLesson}
                  onTaskChange={updateSelectedExistingLessonTask}
                  onOptionChange={updateSelectedExistingLessonOption}
                />
              ) : (
                <div className="rounded-xl bg-gray-50 dark:bg-gray-700/40 px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                  В этом курсе пока нет готовых уроков. Сначала добавьте новый урок, потом он появится здесь для редактирования.
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-primary-300 dark:border-primary-700 rounded-2xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Добавить новый урок
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Здесь можно создать новый урок отдельно, не затрагивая готовые.
                  </p>
                </div>

                <button type="button" onClick={addLesson} className="btn btn-primary">
                  Добавить урок
                </button>
              </div>

              <LessonFields
                lesson={newLessonDraft}
                onLessonChange={updateNewLesson}
                onTaskChange={updateNewLessonTask}
                onOptionChange={updateNewLessonOption}
              />
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Сохранить уроки
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
