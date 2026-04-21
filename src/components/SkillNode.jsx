import { motion } from 'framer-motion'

const SkillNode = ({ lesson, isCompleted, isLocked, isCurrent, onClick, position }) => {
  const getNodeColor = () => {
    if (isCompleted) return 'bg-green-500 border-green-600'
    if (isLocked) return 'bg-gray-400 border-gray-500'
    if (isCurrent) return 'bg-primary-500 border-primary-600'
    return 'bg-blue-500 border-blue-600'
  }

  const getIcon = () => {
    if (isCompleted) return '✅'
    if (isLocked) return '🔒'
    return '📚'
  }

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: position.index * 0.1 }}
      className={`absolute w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-300 ${
        isLocked ? 'cursor-not-allowed' : 'hover:scale-110'
      } ${getNodeColor()}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={isLocked ? null : onClick}
      whileHover={!isLocked ? { scale: 1.1 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
    >
      <div className="text-center">
        <div className="text-lg">{getIcon()}</div>
        <div className="text-xs mt-1">{position.index + 1}</div>
      </div>
    </motion.div>
  )
}

export default SkillNode
