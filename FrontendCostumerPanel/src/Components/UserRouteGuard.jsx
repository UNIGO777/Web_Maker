import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../Stores/AuthenticationStore'
import useUserStore from '../Stores/UserStore'

export default function UserRouteGuard({ children }) {
  const { token } = useAuthStore()
  const { user } = useUserStore()
  const navigate = useNavigate()
  const [isVerified, setIsVerified] = useState(false)

  console.log('Token:', token)
  console.log('User:', user)

  useEffect(() => {
    const checkAccess = async () => {
      // Check if user is authenticated and has user role
      if (!token) {
        console.log('No token found, redirecting to login')
        navigate('/login', { replace: true })
        return
      }

      // Only allow users with 'user' role
      if (!user || user.role !== 'user') {
        console.log('Invalid user role, redirecting to home')
        navigate('/', { replace: true })
        return
      }

      setIsVerified(true)
    }

    checkAccess()
  }, [token, user, navigate])

  // Don't render children until we've verified user access
  if (!isVerified) {
    return null
  }

  return children
}
