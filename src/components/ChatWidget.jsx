import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

const getLocalHelpResponse = (message) => {
  const text = String(message || '').toLowerCase()

  if (text.includes('frontend') || text.includes('html') || text.includes('css')) {
    return 'Во frontend начни с HTML, CSS и JavaScript, потом переходи к React и сборке интерфейсов из компонентов.'
  }

  if (text.includes('backend') || text.includes('api') || text.includes('server')) {
    return 'Backend отвечает за сервер, API, авторизацию, бизнес-логику и работу с базой данных. Полезный порядок: HTTP, Express, маршруты, middleware, JWT и база данных.'
  }

  if (text.includes('database') || text.includes('sql') || text.includes('mongodb')) {
    return 'По базам данных стоит начать с таблиц, ключей, SELECT, JOIN, индексов и нормализации. Для MongoDB ещё важно понять документы, коллекции и схемы.'
  }

  if (text.includes('react')) {
    return 'В React сначала разберись с компонентами, props, state, `useEffect` и маршрутизацией. После этого будет легче работать с формами и API.'
  }

  if (text.includes('javascript') || text.includes('js')) {
    return 'JavaScript нужен для логики интерфейса: события, массивы, функции, DOM и запросы к API. Если хочешь, я могу объяснить конкретную тему по JS.'
  }

  return 'Я могу помочь по HTML, CSS, JavaScript, React, backend и базам данных. Напиши конкретный вопрос, например: "что такое JWT", "объясни JOIN" или "с чего начать backend".'
}

const quickPrompts = [
  'С чего начать frontend?',
  'Что есть по английскому?',
  'Сколько у меня баллов?',
  'Как сбросить пароль?',
]

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Привет! Я EduBot - твой AI помощник по обучению. Задай мне вопрос о языках или IT технологиях!',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await api.post('/ai/chat', {
        message: inputMessage,
        context: 'EduTC educational platform'
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.response?.data?.error || getLocalHelpResponse(inputMessage),
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt)
  }

  return (
    <>
      {/* Кнопка открытия чата */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.button>

      {/* Модальное окно чата */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Оверлей */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50"
            />

            {/* Окно чата */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-3 bottom-3 z-50 flex h-[min(78vh,560px)] flex-col rounded-[24px] bg-white shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[24rem] dark:bg-gray-800"
            >
              {/* Заголовок */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">EduBot</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Помощник по обучению и сайту</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Сообщения */}
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleQuickPrompt(prompt)}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-primary-300 hover:text-primary-600 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-300 dark:hover:border-primary-500 dark:hover:text-primary-300"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[88%] px-4 py-2 rounded-2xl sm:max-w-xs ${
                        message.type === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Индикатор печати */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Поле ввода */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Задайте вопрос..."
                    className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="rounded-xl bg-primary-500 px-3 py-2.5 text-white transition-colors hover:bg-primary-600 disabled:bg-gray-400 sm:px-4"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatWidget
