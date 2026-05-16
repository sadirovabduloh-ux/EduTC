import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import ChatWidget from './components/ChatWidget'
import Hero from './pages/Hero'
import Courses from './pages/Courses'
import LanguagesPage from './pages/LanguagesPage'
import LanguagePage from './pages/LanguagePage'
import ITPage from './pages/ITPage'
import Contact from './pages/Contact'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import AdminDashboard from './pages/AdminDashboard'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'

// Protected Route компонент
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !['admin', 'mentor'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// Public Route компонент (перенаправляет авторизованных пользователей)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen overflow-x-hidden flex flex-col bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        <Header />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <ChatWidget />
      </div>
    </AuthProvider>
  )
}

const pageTransition = {
  initial: { opacity: 0, x: 18, scale: 0.992 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -18, scale: 0.992 },
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="will-change-transform"
      >
        <Routes location={location}>
          <Route path="/" element={<Hero />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/languages" element={<LanguagesPage />} />
          <Route path="/language/:lang" element={<LanguagePage />} />
          <Route path="/it" element={<ITPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default App
