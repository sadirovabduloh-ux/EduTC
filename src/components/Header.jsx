import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { user, logout, isAdmin, isMentor } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { path: '/', label: 'Главная' },
    { path: '/courses', label: 'Курсы' },
    { path: '/leaderboard', label: 'Лидерборд' },
    { path: '/about', label: 'О нас' },
    { path: '/contact', label: 'Контакты' },
  ]

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev)

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 z-50 w-full px-3 pt-3">
      <div className="container mx-auto">
        <div className="ios-mirror-bar rounded-[30px] px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#8ed0ff_0%,#0a84ff_60%,#0066cc_100%)] text-lg text-white shadow-[0_14px_28px_rgba(10,132,255,0.3)]">
                E
              </span>
              <span className="text-xl font-semibold tracking-[-0.03em] text-gray-900 dark:text-white">
                EduTC
              </span>
            </Link>

            <nav className="ios-nav-pill hidden items-center gap-2 rounded-full p-1.5 xl:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`ios-nav-link rounded-full px-4 py-2 text-sm font-medium ${
                    location.pathname === item.path
                      ? 'text-sky-700 dark:text-sky-300'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {location.pathname === item.path && (
                    <motion.span
                      layoutId="header-active-pill"
                      className="ios-nav-link-active"
                      transition={{ type: 'spring', stiffness: 340, damping: 30, mass: 0.8 }}
                    />
                  )}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="ios-nav-pill ios-nav-icon flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors"
                aria-label="Переключить тему"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="ios-nav-pill ios-nav-user flex max-w-[160px] items-center space-x-2 rounded-full p-2 pr-3 transition-colors sm:max-w-none"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden truncate text-gray-700 dark:text-gray-300 sm:block">
                      {user.name}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="ios-user-menu absolute right-0 mt-3 w-[13.5rem] rounded-[24px] py-2"
                      >
                        {(isAdmin || isMentor) && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2.5 text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            {isAdmin ? 'Админ панель' : 'Панель ментора'}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full px-4 py-2.5 text-left text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                        >
                          Выйти
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden space-x-2 xl:flex">
                  <Link to="/login" className="btn btn-secondary">
                    Войти
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    Регистрация
                  </Link>
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className="ios-nav-pill ios-nav-icon flex h-11 w-11 items-center justify-center rounded-full transition-colors xl:hidden"
                aria-label="Меню"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 border-t border-white/50 pb-2 dark:border-white/10 xl:hidden"
              >
                <nav className="mt-4 flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`rounded-2xl px-4 py-3 transition-colors ${
                        location.pathname === item.path
                          ? 'bg-white text-sky-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:bg-gray-800 dark:text-sky-300'
                          : 'text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {user ? (
                    <>
                      {(isAdmin || isMentor) && (
                        <Link
                          to="/admin"
                          className="rounded-2xl px-4 py-3 text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {isAdmin ? 'Админ панель' : 'Панель ментора'}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="rounded-2xl px-4 py-3 text-left text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                      >
                        Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="rounded-2xl px-4 py-3 text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Войти
                      </Link>
                      <Link
                        to="/register"
                        className="rounded-2xl px-4 py-3 text-gray-700 hover:bg-white/70 dark:text-gray-300 dark:hover:bg-gray-800/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Регистрация
                      </Link>
                    </>
                  )}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default Header
