import { motion } from 'framer-motion'

const About = () => {
  return (
    <section className="py-20 px-4 pt-32">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            О нас
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Разработано компанией Sadirov
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            EduTC — это инновационная образовательная платформа, созданная для того, чтобы сделать обучение
            доступным, увлекательным и эффективным. Мы предлагаем высококачественные курсы по различным
            дисциплинам, разработанные экспертами в своих областях.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            Наша миссия — помочь каждому человеку раскрыть свой потенциал через современные образовательные
            технологии и персонализированный подход к обучению.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default About
