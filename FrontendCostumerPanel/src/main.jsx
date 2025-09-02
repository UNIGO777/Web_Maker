import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminRouteGuard from './components/admin/AdminRouteGuard.jsx'
import AdminEditor from './pages/admin/CodeEditor.jsx'
import Components from './pages/admin/Components.jsx'
import TestCodeEditor from './pages/TestCodeEditor.jsx'
import WebEditor from './pages/WebEditor.jsx'
import UserRouteGuard from './Components/UserRouteGuard.jsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: (<Login />) },
      { path: 'register', element: (<Register />) },
      { path: 'dashboard', element: (<UserRouteGuard><Dashboard /></UserRouteGuard>)},  
      
      { path: 'web-editor', element: <WebEditor /> },
      { path: 'web-editor/:id', element: (<UserRouteGuard><WebEditor /></UserRouteGuard>) },

    ],
  },
  {
    path: '/admin',
    children: [
      { path: 'login', element: <AdminLogin /> },
      { 
        path: 'dashboard', 
        element: (
          <AdminRouteGuard>
            <AdminDashboard />
          </AdminRouteGuard>
        ) 
      },
      { 
        path: 'components', 
        element: (
          <AdminRouteGuard>
            <Components />
          </AdminRouteGuard>
        ) 
      },
      { 
        path: 'code/:component_id', 
        element: (
          <AdminRouteGuard>
            <AdminEditor />
          </AdminRouteGuard>
        ) 
      }
    ],
  },
])



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
