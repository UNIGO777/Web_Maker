import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Play, Sparkles, ChevronDown } from 'lucide-react'
import useAuthStore from '../Stores/AuthenticationStore'


export default function Hero() {

  const authStore = useAuthStore()
  const {token} = authStore
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
      <div className="relative  mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 mb-8"
        >
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium text-slate-700">Create websites in minutes, not hours</span>
        </motion.div>


        
        <motion.h1 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
        >
          Create Your Website in
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"> Minutes</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed"
        >
          Web Maker is the ultimate platform for customers to build professional websites instantly. 
          No coding required, just drag, drop, and launch your dream website.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to={token ? "/dashboard" : "/register"} 
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-blue-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              Start Building Free
              <ArrowRight size={20} />
            </Link>
          </motion.div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-3 border-2 border-slate-300 text-slate-700 px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
          >
            <Play size={20} />
            Watch Demo
          </motion.button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16"
        >
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-2 text-slate-500"
          >
            <ChevronDown size={20} />
            <span className="text-sm">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
