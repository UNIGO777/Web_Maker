import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../Stores/AuthenticationStore'

export default function AdminRouteGuard({ children }) {
  const { adminToken, adminUser } = useAuthStore()
  const navigate = useNavigate()

  

  useEffect(() => {
    // Check if user is authenticated and has admin role
    if (!adminToken) {
      navigate('/admin/login')
      return
    }

    if (adminUser?.role !== 'admin') {
      navigate('/')
      return
    }
  }, [adminToken, adminUser, navigate])

  // Don't render children until we've verified admin access
  if (!adminToken || adminUser?.role !== 'admin') {
    return null
  }

  return children
}
