import { motion } from 'framer-motion'
import { Activity, LogOut } from 'lucide-react'

export default function AdminHeader({ user, onLogout }) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="px-10 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Welcome,</span>
              <span className="font-medium text-slate-900">{user?.firstName} {user?.lastName}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
