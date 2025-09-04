import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Wand2 } from 'lucide-react'
import useAuthStore from '../Stores/AuthenticationStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Get the login function from the zustand store
  const { login, error, setError, token } = useAuthStore()

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, navigate])






  // Handle form submit and call login from zustand
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // login should be a function that accepts email and password
      await login(email, password)
      
      // Optionally, you can redirect here if your login function doesn't do it
    } catch (err) {
      // Handle error from login (assuming error message is in err.message)
      setError(err?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 text-slate-800 mb-2">
            <Wand2 size={20} className="text-primary md:w-6 md:h-6" />
            <span className="text-lg md:text-xl font-bold">Web Maker</span>
          </div>
          <p className="text-xs md:text-sm text-slate-500">Build beautiful portfolios with ease</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <LogIn className="text-slate-700" size={16} />
            <h1 className="text-base md:text-lg font-semibold text-slate-800">Sign in</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6">Welcome back! Sign in to continue building your portfolio.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-8 md:pl-9 pr-3 py-2 md:py-2.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-8 md:pl-9 pr-3 py-2 md:py-2.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="Your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2.5 md:py-3 text-sm md:text-base font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Signing in…' : (<><LogIn size={14} className="md:w-4 md:h-4" /> Sign in</>)}
            </button>
          </form>

          <p className="text-center text-xs md:text-sm text-slate-600 mt-4 md:mt-6">
            New to Web Maker?{' '}
            <Link to="/register" className="text-primary hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
