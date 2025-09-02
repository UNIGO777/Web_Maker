import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import useAuthStore from './Stores/AuthenticationStore'
import useUserStore from './Stores/UserStore'
import './App.css'
import Header from './components/Header'



function App() {
  const { token, adminToken ,adminUser } = useAuthStore()
  const { fetchMe } = useUserStore()
  
  

  useEffect(() => {
    if (token) {
      fetchMe()
    }
  }, [token, fetchMe])

  return (
    <>
    <Header/>
      <Outlet />
    </>
  )
}

export default App
