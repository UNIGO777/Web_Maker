import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const adminToken = localStorage.getItem('adminToken')
  // console.log(adminToken)
  
  // Check if the request is for admin routes
  console.log(location.pathname)
  const isAdminRoute = location.pathname && (location.pathname.includes('/admin') || location.pathname.startsWith('/admin'))
  
  if (isAdminRoute && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (!isAdminRoute && token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log(error)
    const status = error?.response?.status
    const data = error?.response?.data
    const firstError = Array.isArray(data?.errors) && data.errors.length > 0 ? data.errors[0] : undefined
    const validationMsg = firstError?.msg || firstError?.message
    const serverMsg = data?.message
    const message = validationMsg || serverMsg || error.message || 'Something went wrong'

    if (status === 401) {
      localStorage.removeItem('token')
    }

    return Promise.reject(new Error(message))
  }
)

export default api


