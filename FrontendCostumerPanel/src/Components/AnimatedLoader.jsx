import { motion } from 'framer-motion'
import { Code, Palette, Layout, Zap } from 'lucide-react'

const AnimatedLoader = ({ message = "Loading...", showIcons = true }) => {
  const icons = [Code, Palette, Layout, Zap]

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          {/* Outer Ring */}
          <motion.div
            className="w-20 h-20 border-4 border-slate-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Ring */}
          <motion.div
            className="absolute inset-2 w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center Dot */}
          <motion.div
            className="absolute inset-1/2 w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>

        {/* Floating Icons */}
        {showIcons && (
          <div className="relative mb-6">
            {icons.map((Icon, index) => {
              const angle = (index * 90) * (Math.PI / 180)
              const radius = 40
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius
              
              return (
                <motion.div
                  key={index}
                  className="absolute w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  <Icon size={16} className="text-primary" />
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Loading Text */}
        <motion.div
          className="text-slate-600 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnimatedLoader