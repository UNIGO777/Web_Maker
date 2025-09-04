import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import api from '../../lib/axios'
import useAuthStore from '../../Stores/AuthenticationStore'
import AdminHeader from '../../components/admin/AdminHeader'
import AdminNavigation from '../../components/admin/AdminNavigation'
import OverviewTab from '../../components/admin/OverviewTab'
import UsersTab from '../../components/admin/UsersTab'
// import ProjectsTab from '../../components/admin/ProjectsTab'
// import SettingsTab from '../../components/admin/SettingsTab'
import Components from './Components'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeUsers: 0,
    growthRate: 0
  })
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  
  const navigate = useNavigate()
  const { adminToken, adminUser, AdminLogout, user } = useAuthStore()

  useEffect(() => {
    if (!adminToken || adminUser?.role !== 'admin') {
      navigate('/admin/login')
      return
    }
    
    loadDashboardData()
  }, [adminToken, adminUser, navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load statistics
      const statsResponse = await api.get('/admin/stats')
      setStats(statsResponse.data.data)
      
      // Load users
      const usersResponse = await api.get('/admin/users')
      setUsers(usersResponse.data.data.users)
      
      // Load projects
      const projectsResponse = await api.get('/admin/projects')
      setProjects(projectsResponse.data.data.projects)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      if (error.response?.status === 401) {
        AdminLogout()
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AdminLogout()
    navigate('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} onLogout={handleLogout} />
      <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="px-10 mx-auto sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} />
          )}
          {activeTab === 'users' && (
            <UsersTab 
              users={users} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm}
              onUserUpdate={loadDashboardData}
            />
          )}
          {activeTab === 'components' && (
            <Components
              projects={projects} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
            />
          )}
          {/* {activeTab === 'settings' && (
            <SettingsTab />
          )} */}
        </AnimatePresence>
      </main>
    </div>
  )
}
