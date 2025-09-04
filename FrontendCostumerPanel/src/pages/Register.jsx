import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Wand2 } from 'lucide-react'
import api from '../lib/axios'
import useAuthStore from '../Stores/AuthenticationStore'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const authStore = useAuthStore()
  const { register, error, setError, token } = authStore

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ firstName, lastName, email, password })
    } catch (err) {
      setError(err.message)
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

        {/* Register Form */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <UserPlus className="text-slate-700" size={16} />
            <h1 className="text-base md:text-lg font-semibold text-slate-800">Create your account</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6">Start crafting beautiful portfolios with Web Maker.</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs md:text-sm font-medium text-slate-700 mb-1 w-full text-start">First name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                  <input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 pl-8 md:pl-9 pr-3 py-2 md:py-2.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs md:text-sm font-medium text-slate-700 mb-1 w-full text-start">Last name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                  <input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 pl-8 md:pl-9 pr-3 py-2 md:py-2.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs md:text-sm font-medium text-slate-700 mb-1 w-full text-start">Email</label>
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
              <label htmlFor="password" className="block text-xs md:text-sm font-medium text-slate-700 mb-1 w-full text-start">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 pl-8 md:pl-9 pr-3 py-2 md:py-2.5 text-sm md:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2.5 md:py-3 text-sm md:text-base font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating account…' : (<><UserPlus size={14} className="md:w-4 md:h-4" /> Create account</>)}
            </button>
          </form>

          <p className="text-center text-xs md:text-sm text-slate-600 mt-4 md:mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}


