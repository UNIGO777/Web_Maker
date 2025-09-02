import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wand2, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../Stores/AuthenticationStore'
import useUserStore from '../Stores/UserStore'
import Logo from '../assets/Logo.png'

export default function Header() {

  const { token } = useAuthStore()
  const { user } = useUserStore()
  console.log(user)

  
  
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200"
    >
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <img src={Logo} className='h-16' alt="" />
          </motion.div>
          <div className="flex items-center gap-3">
            {!token ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
                    Get Started
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} className='hidden md:flex' whileTap={{ scale: 0.95 }} >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{
                    scale: 1.06,
                    boxShadow: "0 4px 24px 0 rgba(37, 99, 235, 0.12)",
                    backgroundColor: "rgba(59,130,246,0.08)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex p-1 items-center gap-4 border-2 border-slate-200 rounded-full px-4 bg-white cursor-pointer hover:border-blue-500"
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-200  transition-all duration-300"
                  >
                    <User size={18} className="text-slate-700 group-hover:text-white transition-colors duration-300" />
                  </Link>
                  <span className="font-medium text-slate-700">{user?.firstName}</span>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
