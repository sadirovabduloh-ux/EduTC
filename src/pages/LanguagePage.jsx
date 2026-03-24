import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Quiz from '../components/Quiz'
import Lesson from '../components/Lesson'

const languages = {
  english: {
    name: 'Английский',
    flag: '🇬🇧',
    quiz: [
      { question: 'What is the capital of the United Kingdom?', options: ['London', 'Paris', 'Berlin', 'Madrid'], correct: 0 },
      { question: 'How do you say "Hello" in English?', options: ['Hola', 'Bonjour', 'Hello', 'Ciao'], correct: 2 },
      { question: 'What is the past tense of "go"?', options: ['went', 'gone', 'going', 'goes'], correct: 0 },
      { question: 'Which word is a color?', options: ['Apple', 'Blue', 'Run', 'Big'], correct: 1 },
      { question: 'What is the plural of "child"?', options: ['Childs', 'Children', 'Childes', 'Childrens'], correct: 1 },
      { question: 'Choose the correct sentence:', options: ['I am student', 'I student am', 'Am I student', 'I am a student'], correct: 3 },
      { question: 'What does "happy" mean?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correct: 2 },
      { question: 'Which is a question word?', options: ['And', 'What', 'But', 'Or'], correct: 1 },
      { question: 'What is the opposite of "hot"?', options: ['Cold', 'Warm', 'Big', 'Small'], correct: 0 },
      { question: 'How many days are in a week?', options: ['5', '6', '7', '8'], correct: 2 }
    ],
    lessons: [
      {
        title: 'Урок 1: Основы приветствий',
        explanation: 'В английском языке приветствия очень важны для общения. Давайте научимся основным фразам.',
        example: 'Hello! How are you? - Привет! Как дела?',
        task: { type: 'input', question: 'Translate "Hello" to Russian:', answer: 'привет' }
      },
      {
        title: 'Урок 2: Числа и время',
        explanation: 'Числа используются для указания времени, количества и многого другого.',
        example: 'One, two, three... - Один, два, три...',
        task: { type: 'multiple', question: 'Какое число следует за "five"?', options: ['Four', 'Six', 'Seven', 'Eight'], answer: 'Six' }
      },
      {
        title: 'Урок 3: Семья и родственники',
        explanation: 'Слова для описания членов семьи помогут вам рассказать о близких.',
        example: 'Mother, father, brother, sister - Мама, папа, брат, сестра',
        task: { type: 'input', question: 'Напишите английское слово для "брат":', answer: 'brother' }
      }
    ]
  },
  arabic: {
    name: 'Арабский',
    flag: '🇸🇦',
    quiz: [
      { question: 'Как сказать "привет" на арабском?', options: ['مرحبا', 'Hello', 'Bonjour', 'Ciao'], correct: 0 },
      { question: 'Какой алфавит используется в арабском?', options: ['Латинский', 'Кириллица', 'Арабский', 'Иероглифы'], correct: 2 },
      { question: 'Как сказать "спасибо" на арабском?', options: ['شكراً', 'Thank you', 'Merci', 'Grazie'], correct: 0 },
      { question: 'Какое число "один" на арабском?', options: ['واحد', 'اثنان', 'ثلاثة', 'أربعة'], correct: 0 },
      { question: 'Как сказать "да" на арабском?', options: ['لا', 'نعم', 'ربما', 'أبداً'], correct: 1 },
      { question: 'Какой цвет "синий" на арабском?', options: ['أحمر', 'أزرق', 'أخضر', 'أصفر'], correct: 1 },
      { question: 'Как сказать "вода" на арабском?', options: ['ماء', 'خبز', 'لحم', 'فواكه'], correct: 0 },
      { question: 'Какое время суток "утро"?', options: ['صباح', 'مساء', 'ليل', 'ظهر'], correct: 0 },
      { question: 'Как сказать "школа" на арабском?', options: ['مدرسة', 'جامعة', 'مكتب', 'منزل'], correct: 0 },
      { question: 'Какое животное "кошка"?', options: ['كلب', 'قطة', 'خيل', 'بقرة'], correct: 1 }
    ],
    lessons: [
      {
        title: 'Урок 1: Арабский алфавит',
        explanation: 'Арабский алфавит состоит из 28 букв и пишется справа налево.',
        example: 'ا ب ت - алф, ба, та',
        task: { type: 'input', question: 'Напишите первую букву арабского алфавита:', answer: 'ا' }
      },
      {
        title: 'Урок 2: Числа в арабском',
        explanation: 'Числа в арабском языке имеют свою форму и порядок.',
        example: '1 - واحد, 2 - اثنان, 3 - ثلاثة',
        task: { type: 'multiple', question: 'Какое число "2" на арабском?', options: ['واحد', 'اثنان', 'ثلاثة', 'أربعة'], answer: 'اثنان' }
      },
      {
        title: 'Урок 3: Повседневные фразы',
        explanation: 'Эти фразы помогут вам в повседневном общении.',
        example: 'كيف حالك؟ - Как дела?',
        task: { type: 'input', question: 'Напишите арабское слово для "спасибо":', answer: 'شكراً' }
      }
    ]
  },
  russian: {
    name: 'Русский',
    flag: '🇷🇺',
    quiz: [
      { question: 'Какой падеж используется для объекта действия?', options: ['Именительный', 'Винительный', 'Родительный', 'Дательный'], correct: 1 },
      { question: 'Как сказать "спасибо" на русском?', options: ['Please', 'Thank you', 'Спасибо', 'Merci'], correct: 2 },
      { question: 'Какой род у слова "дом"?', options: ['Женский', 'Мужской', 'Средний', 'Нет рода'], correct: 1 },
      { question: 'Какое время "прошлое" в русском?', options: ['Настоящее', 'Будущее', 'Прошлое', 'Нет времени'], correct: 2 },
      { question: 'Как сказать "привет" на русском?', options: ['Hello', 'Bonjour', 'Привет', 'Ciao'], correct: 2 },
      { question: 'Какой цвет "красный" на русском?', options: ['Красный', 'Синий', 'Зеленый', 'Желтый'], correct: 0 },
      { question: 'Какое число "пять" на русском?', options: ['Один', 'Два', 'Три', 'Пять'], correct: 3 },
      { question: 'Как сказать "школа" на русском?', options: ['Школа', 'Университет', 'Работа', 'Дом'], correct: 0 },
      { question: 'Какой день недели "понедельник"?', options: ['Понедельник', 'Вторник', 'Среда', 'Четверг'], correct: 0 },
      { question: 'Как сказать "вода" на русском?', options: ['Вода', 'Хлеб', 'Мясо', 'Фрукты'], correct: 0 }
    ],
    lessons: [
      {
        title: 'Урок 1: Русский алфавит',
        explanation: 'Русский алфавит основан на кириллице и состоит из 33 букв.',
        example: 'А Б В Г Д - А, Бэ, Вэ, Гэ, Дэ',
        task: { type: 'input', question: 'Напишите первую букву русского алфавита:', answer: 'а' }
      },
      {
        title: 'Урок 2: Род существительных',
        explanation: 'В русском языке существительные имеют три рода: мужской, женский и средний.',
        example: 'Стол (мужской), Книга (женская), Окно (средний)',
        task: { type: 'multiple', question: 'Какой род у слова "солнце"?', options: ['Мужской', 'Женский', 'Средний'], answer: 'Средний' }
      },
      {
        title: 'Урок 3: Времена глаголов',
        explanation: 'Русские глаголы изменяются по временам: настоящее, прошедшее, будущее.',
        example: 'Читать (настоящее: читаю), Читал (прошлое), Буду читать (будущее)',
        task: { type: 'input', question: 'Напишите прошедшее время глагола "идти":', answer: 'шел' }
      }
    ]
  }
}

const LanguagePage = () => {
  const { lang } = useParams()
  const language = languages[lang]
  const [mode, setMode] = useState('select') // 'select', 'quiz', 'lesson'

  if (!language) {
    return <div className="min-h-screen flex items-center justify-center">Курс не найден</div>
  }

  const handleStartQuiz = () => setMode('quiz')
  const handleStartLesson = () => setMode('lesson')
  const handleBackToSelect = () => setMode('select')
  const handleLessonComplete = () => setMode('select')

  return (
    <section className="min-h-screen py-20 px-4 pt-32">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="text-6xl mb-4">{language.flag}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {language.name}
          </h1>
        </motion.div>

        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Выберите действие
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleStartQuiz}
                className="w-full btn btn-primary text-lg py-4"
              >
                ✅ Проверить знания
              </button>
              <button
                onClick={handleStartLesson}
                className="w-full btn btn-secondary text-lg py-4"
              >
                🎓 Начать обучение
              </button>
            </div>
          </motion.div>
        )}

        {mode === 'quiz' && (
          <Quiz
            questions={language.quiz}
            onComplete={handleBackToSelect}
            onStartLesson={handleStartLesson}
          />
        )}

        {mode === 'lesson' && (
          <Lesson
            lessons={language.lessons}
            onComplete={handleLessonComplete}
          />
        )}
      </div>
    </section>
  )
}

export default LanguagePage