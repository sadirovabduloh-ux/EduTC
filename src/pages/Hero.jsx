import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className="min-h-screen px-4 pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="ios-section-shell overflow-hidden px-4 py-6 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.95fr] lg:gap-10">
            <div className="text-center lg:text-left">
              <span className="ios-chip mb-5">
                Плавный iPhone-style интерфейс для обучения
              </span>
              <h1 className="mb-5 text-4xl font-semibold leading-[0.98] tracking-[-0.05em] text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Образование,
                <span className="block bg-gradient-to-b from-sky-500 to-blue-700 bg-clip-text text-transparent">
                  которое feels native
                </span>
              </h1>
              <p className="mb-7 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-8">
                Языки, IT и понятный учебный путь в интерфейсе, который ощущается как аккуратное мобильное приложение, а не просто сайт.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link to="/courses" className="btn btn-primary w-full text-base sm:w-auto sm:text-lg">
                  Открыть курсы
                </Link>
                <Link to="/leaderboard" className="btn btn-secondary w-full text-base sm:w-auto sm:text-lg">
                  Смотреть лидерборд
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mx-auto w-full max-w-[340px] sm:max-w-[360px]"
            >
              <div className="ios-orb-card p-5 sm:p-6">
                <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,rgba(255,255,255,0.68)_0%,rgba(242,247,255,0.42)_100%)] p-4 sm:min-h-[360px] sm:rounded-[28px] sm:p-6 dark:bg-[linear-gradient(180deg,rgba(20,26,37,0.7)_0%,rgba(15,20,30,0.48)_100%)]">
                  <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[radial-gradient(circle,#8fd7ff_0%,rgba(143,215,255,0.18)_62%,transparent_72%)] blur-sm" />
                  <div className="absolute -left-12 top-20 h-32 w-32 rounded-full bg-[radial-gradient(circle,#ff8aa5_0%,rgba(255,138,165,0.18)_62%,transparent_72%)] blur-sm" />
                  <div className="absolute bottom-0 right-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,#6fe4d7_0%,rgba(111,228,215,0.16)_60%,transparent_72%)] blur-sm" />

                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                        EduTC
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-2xl dark:text-white">
                        Liquid Learning
                      </h2>
                    </div>
                    <span className="ios-chip text-xs sm:text-sm">Glass UI</span>
                  </div>

                  <div className="relative z-10 mt-8 space-y-4">
                    <div className="rounded-[22px] bg-white/78 p-4 shadow-[0_14px_26px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[26px] dark:bg-gray-900/58">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Активное обучение
                        </span>
                        <span className="text-sm font-semibold text-sky-600 dark:text-sky-300">
                          72%
                        </span>
                      </div>
                      <div className="mb-3 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-2.5 w-[72%] rounded-full bg-[linear-gradient(90deg,#4fd1c5_0%,#0a84ff_52%,#7c7cff_100%)]" />
                      </div>
                      <p className="text-base font-semibold tracking-[-0.03em] text-slate-900 sm:text-lg dark:text-white">
                        Frontend Essentials
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {[
                        ['Языки', '🗣️', 'from-sky-200/90 to-sky-50/70 dark:from-sky-500/20 dark:to-sky-400/5'],
                        ['IT', '💻', 'from-violet-200/90 to-fuchsia-50/70 dark:from-violet-500/20 dark:to-fuchsia-400/5'],
                        ['Тесты', '✦', 'from-rose-200/90 to-orange-50/70 dark:from-rose-500/20 dark:to-orange-400/5'],
                        ['Рост', '↗', 'from-teal-200/90 to-cyan-50/70 dark:from-teal-500/20 dark:to-cyan-400/5'],
                      ].map(([label, icon, gradient], index) => (
                        <motion.div
                          key={label}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + index * 0.08 }}
                          className={`rounded-[20px] border border-white/70 bg-gradient-to-br ${gradient} p-3 text-left shadow-[0_14px_26px_rgba(15,23,42,0.07)] backdrop-blur-xl sm:rounded-[24px] sm:p-4`}
                        >
                          <div className="mb-2 text-xl sm:mb-3 sm:text-2xl">{icon}</div>
                          <div className="text-xs font-semibold text-slate-800 sm:text-sm dark:text-white">
                            {label}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
