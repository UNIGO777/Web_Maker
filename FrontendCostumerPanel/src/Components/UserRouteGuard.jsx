import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../Stores/AuthenticationStore'
import useUserStore from '../Stores/UserStore'

export default function UserRouteGuard({ children }) {
  const { token } = useAuthStore()
  const { user, loading } = useUserStore()
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)



  useEffect(() => {
    const checkAccess = async () => {
      // Check if user is authenticated
      if (!token) {
  
        navigate('/login', { replace: true })
        return
      }

      // Wait for user data to be loaded before checking role
      if (loading) {
    
        return
      }

      // Only allow users with 'user' role
      

      setIsVerified(true)
    }

    checkAccess()
  }, [token, user, loading, navigate])

  // Show loading state while user data is being fetched
  if (token && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  // Don't render children until we've verified user access
  if (!isVerified) {
    return null
  }

  return children
}
