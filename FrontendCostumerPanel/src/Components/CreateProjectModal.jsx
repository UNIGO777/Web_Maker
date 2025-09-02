import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import api from '../lib/axios'

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    isPublic: true
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Create FormData for file upload
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('isPublic', formData.isPublic)
      
      // Add thumbnail file if selected
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      }
      
      const { data } = await api.post('/projects/test', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      onSuccess(data.data.project)
      onClose()
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        thumbnail: '',
        isPublic: true
      })
      setThumbnailFile(null)
      setThumbnailPreview('')
    } catch (error) {
      setError(error.response?.data?.message || error.message)
      console.error('Error creating project:', error)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = () => {
    return formData.name.trim().length > 0
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Describe your project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Thumbnail Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      setThumbnailFile(file)
                      const reader = new FileReader()
                      reader.onload = (e) => setThumbnailPreview(e.target.result)
                      reader.readAsDataURL(file)
                    } else {
                      setThumbnailFile(null)
                      setThumbnailPreview('')
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                {thumbnailPreview && (
                  <div className="mt-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-32 h-32 object-cover rounded-lg border border-slate-300"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/30"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-slate-700">
                  Make project public
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !canSubmit()}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
