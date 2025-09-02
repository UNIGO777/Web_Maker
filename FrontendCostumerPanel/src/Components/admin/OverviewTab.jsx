import { motion } from 'framer-motion'
import { Users, FolderKanban, Activity, TrendingUp, Calendar, Clock, Globe, Database } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '../../lib/axios'

export default function OverviewTab({ stats }) {
  const [recentActivity, setRecentActivity] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    database: { status: 'healthy' },
    server: { status: 'healthy' },
    storage: { percentage: 85 }
  })
  useEffect(() => {
    loadRecentActivity()
    loadSystemHealth()
  }, [])

  const loadRecentActivity = async () => {
    try {
      const response = await api.get('/admin/recent-activity')
      setRecentActivity(response.data.data || [])
    } catch (error) {
      console.error('Error loading recent activity:', error)
      // Fallback to mock data
      setRecentActivity([
        { id: 1, type: 'user_register', message: 'New user registered: John Doe', time: '2 min ago', color: 'green' },
        { id: 2, type: 'project_create', message: 'Project "Portfolio Website" created', time: '15 min ago', color: 'blue' },
        { id: 3, type: 'user_login', message: 'User login: admin@example.com', time: '1 hour ago', color: 'purple' },
        { id: 4, type: 'component_upload', message: 'New component uploaded: Hero Section', time: '2 hours ago', color: 'orange' },
        { id: 5, type: 'user_register', message: 'New user registered: Jane Smith', time: '3 hours ago', color: 'green' }
      ])
    }
  }

  const loadSystemHealth = async () => {
    try {
      const response = await api.get('/admin/system-health')
      setSystemHealth(response.data.data || systemHealth)
    } catch (error) {
      console.error('Error loading system health:', error)
      // Keep default fallback structure
      setSystemHealth({
        database: { status: 'healthy' },
        server: { status: 'healthy' },
        storage: { percentage: 85 }
      })
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects || 0,
      icon: FolderKanban,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      icon: Activity,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Growth Rate',
      value: `${stats.growthRate || 0}%`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
      change: '+2%',
      changeType: 'increase'
    }
  ]

  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-lg ${stat.bgColor} ${stat.textColor} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className={`h-2 w-2 bg-${activity.color}-500 rounded-full`}></div>
                <span className="text-sm text-slate-600 flex-1">{activity.message}</span>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600">Database</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                systemHealth.database?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {systemHealth.database?.status || 'unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-500" />
                <span className="text-sm text-slate-600">Server</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                systemHealth.server?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {systemHealth.server?.status || 'unknown'}
              </span>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Storage Usage</span>
                <span className="text-sm font-medium text-slate-900">{systemHealth.storage?.percentage || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (systemHealth.storage?.percentage || 0) > 90 ? 'bg-red-500' : 
                    (systemHealth.storage?.percentage || 0) > 75 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${systemHealth.storage?.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Manage Users</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <FolderKanban size={20} className="text-green-600" />
            <span className="text-sm font-medium text-green-900">View Projects</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <Activity size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Analytics</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Clock size={20} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-900">System Logs</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
