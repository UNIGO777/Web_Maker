import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FolderKanban, Plus, ExternalLink, Github, Layers, Edit, Trash2, MoreVertical } from 'lucide-react'
import api from '../lib/axios'
import useAuthStore from '../Stores/AuthenticationStore'
import CreateProjectModal from '../Components/CreateProjectModal'
import WebsiteConfigForm from '../Components/WebsiteConfigForm'

export default function Dashboard() {
  const { token } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [portfolio, setPortfolio] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showWebsiteConfig, setShowWebsiteConfig] = useState(false)
  const [newProject, setNewProject] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.dropdown-container')) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [activeDropdown])

  

  const handleProjectCreated = async (createdProject) => {
    // Show website configuration form first
    setNewProject(createdProject);
    setShowWebsiteConfig(true);
  }

  const handleWebsiteConfigSaved = (websiteData) => {
    // Navigate to web editor after website config is saved
    if (newProject && newProject._id) {
      navigate(`/web-editor/${newProject._id}`);
    }
    setShowWebsiteConfig(false);
    setNewProject(null);
  }

  const handleWebsiteConfigSkipped = () => {
    // Navigate to web editor without configuring website
    if (newProject && newProject._id) {
      navigate(`/web-editor/${newProject._id}`);
    }
    setShowWebsiteConfig(false);
    setNewProject(null);
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      setDeleting(true);
      await api.delete(`/projects/${projectToDelete._id}`);
      
      // Remove project from local state
      setPortfolio(prev => prev.filter(p => p._id !== projectToDelete._id));
      
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  }

  const openDeleteModal = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setActiveDropdown(null);
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
    <div className="min-h-screen bg-slate-50 pt-20 md:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="px-2 md:px-5 mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-center">
              <FolderKanban size={16} className="md:w-5 md:h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Your Projects</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center"
          >
            <Plus size={16} />
            <span className="hidden xs:inline">New Project</span>
            <span className="xs:hidden">New</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {portfolio?.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl cursor-pointer border border-slate-200 p-4 md:p-5 hover:shadow-lg transition-shadow flex flex-col">
                {/* Thumbnail */}
                <div className="w-full h-[200px] md:h-[250px] mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail.includes('http') ? p.thumbnail : `http://localhost:5001${p.thumbnail}`}
                      alt={p.name}
                      className="object-fit w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'fallback-image-url.jpg';
                      }}
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                      <div className="w-20 h-20 mb-4 rounded-xl bg-slate-200 flex items-center justify-center">
                        <Layers size={32} />
                      </div>
                      <p className="text-sm text-center">Project Preview</p>
                      <p className="text-xs text-center mt-1">Add thumbnail to showcase your project</p>
                    </div>
                  )}
                </div>
                {/* Project Name and Status */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 line-clamp-1 flex-1 mr-2">{p.name}</h3>
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
                {/* Project Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <button
                      onClick={() => navigate(`/web-editor/${p._id}`)}
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs md:text-sm font-medium"
                    >
                      <Edit size={12} className="md:w-[14px] md:h-[14px]" /> 
                      <span className="hidden sm:inline">Edit Website</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline text-xs md:text-sm">
                        <ExternalLink size={12} className="md:w-[14px] md:h-[14px]" /> Live
                      </a>
                    )}
                    {p.githubUrl && (
                      <a href={p.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-700 hover:underline text-xs md:text-sm">
                        <Github size={12} className="md:w-[14px] md:h-[14px]" /> Code
                      </a>
                    )}
                  </div>
                  
                  {/* Project Options Dropdown */}
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === p._id ? null : p._id)}
                      className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical size={16} className="text-slate-500" />
                    </button>
                    
                    {activeDropdown === p._id && (
                      <div className="absolute right-0 top-full mt-1 w-28 md:w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="flex items-center gap-2 px-2 md:px-3 py-2 text-xs md:text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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

      {/* Website Configuration Modal */}
      {showWebsiteConfig && newProject && newProject.website && (
        <WebsiteConfigForm
          website={newProject.website}
          onClose={handleWebsiteConfigSkipped}
          onSave={handleWebsiteConfigSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Project
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete "{projectToDelete.name}"? This action cannot be undone and will also delete any associated website.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
