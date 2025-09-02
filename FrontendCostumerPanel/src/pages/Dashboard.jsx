import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, Plus, ExternalLink, Github, Layers } from 'lucide-react'
import api from '../lib/axios'
import useAuthStore from '../Stores/AuthenticationStore'
import CreateProjectModal from '../components/CreateProjectModal'

export default function Dashboard() {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [portfolio, setPortfolio] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await api.get('/projects')
        // console.log(data.data.projects)
        setPortfolio(data?.data?.projects || null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (token) load()
    else navigate('/login')
  }, [token, navigate])

  

  const handleProjectCreated = async (newProject) => {
    // Refresh the portfolio data to show the new project
    try {
      setLoading(true)
      setError('')
      const { data } = await api.get('/portfolio')
      setPortfolio(data?.data?.portfolio || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const projects = portfolio?.projects || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading your dashboard…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="px-5 mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Your Projects</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <Plus size={16} />
            New Project
          </motion.button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        {portfolio?.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 py-24 px-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Layers size={28} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Start building your first project</h2>
            <p className="text-slate-600 mb-8 max-w-md">Create an impressive project to showcase on your portfolio. You can add title, description, technologies, and links.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <Plus size={18} />
              Start building your first project
            </motion.button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolio?.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl cursor-pointer border border-slate-200 p-5 hover:shadow-lg transition-shadow flex flex-col">
                {/* Thumbnail */}
                {p.thumbnail && (
                  <div className="w-full h-[250px] mb-4 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={p.thumbnail.includes('http') ? p.thumbnail : `http://localhost:5001${p.thumbnail}`}
                      alt={p.name}
                      className="object-fit w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = 'fallback-image-url.jpg'; // Add a fallback image URL
                      }}
                      loading="lazy" // Add lazy loading
                      crossOrigin="anonymous" // Add CORS header
                    />
                  </div>
                )}
                {/* Project Name and Status */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{p.name}</h3>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : p.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Draft'}
                  </span>
                </div>
                {/* Slug */}
                <div className="text-xs text-slate-400 mb-1">{p.slug && <>/{p.slug}</>}</div>
                {/* Description */}
                <p className="text-sm text-slate-600 line-clamp-3 mb-3">{p.description}</p>
                {/* Technologies */}
                {Array.isArray(p.technologies) && p.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.technologies.map((t, idx) => (
                      <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{t}</span>
                    ))}
                  </div>
                )}
                {/* Palette Preview */}
                {p.design?.palette && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400">Palette:</span>
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ background: p.design.palette.primary }}
                      title={`Primary: ${p.design.palette.primary}`}
                    />
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ background: p.design.palette.secondary }}
                      title={`Secondary: ${p.design.palette.secondary}`}
                    />
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ background: p.design.palette.accent }}
                      title={`Accent: ${p.design.palette.accent}`}
                    />
                  </div>
                )}
                {/* Public/Private */}
                <div className="mb-3">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded ${
                    p.isPublic ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {p.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                {/* Links */}
                <div className="flex items-center gap-3 mb-2">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                      <ExternalLink size={14} /> Live
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-700 hover:underline text-sm">
                      <Github size={14} /> Code
                    </a>
                  )}
                </div>
                {/* Created/Updated */}
                <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2">
                  <span>
                    Created: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </span>
                  <span>
                    Updated: {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  )
}
