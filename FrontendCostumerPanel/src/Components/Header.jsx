import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wand2, User, LayoutDashboard, LogOut } from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../Stores/AuthenticationStore'
import useUserStore from '../Stores/UserStore'
import Logo from '../assets/Logo.png'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { token, logout } = useAuthStore()
  const { user } = useUserStore()

  
  const Navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
  }
  
  
  
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer" onClick={() => {
             Navigate('/')
          }}>
            <img src={Logo} className='h-12 md:h-16' alt="Portfolio Maker" />
          </motion.div>
          <div className="flex items-center gap-2 md:gap-3">
            {!token ? (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-800 px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign in
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="bg-gradient-to-r from-primary to-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
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
                <div className="relative">
                  <motion.div
                    whileHover={{
                      scale: 1.06,
                      boxShadow: "0 4px 24px 0 rgba(37, 99, 235, 0.12)",
                      backgroundColor: "rgba(59,130,246,0.08)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex p-1 items-center gap-4 border-2 border-slate-200 rounded-full px-4 bg-white cursor-pointer hover:border-blue-500"
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
                  >
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full bg-slate-200 transition-all duration-300"
                    >
                      <User size={16} className="md:w-[18px] md:h-[18px] text-slate-700 group-hover:text-white transition-colors duration-300" />
                    </Link>
                    <span className="font-medium text-slate-700 text-sm md:text-base hidden sm:inline">{user?.firstName}</span>
                  </motion.div>
                  
                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-1 w-40 md:w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50"
                      onMouseEnter={() => setShowProfileMenu(true)}
                      onMouseLeave={() => setShowProfileMenu(false)}
                    >
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                      <hr className="my-1 border-slate-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
