import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader } from 'lucide-react';
import api from '../../lib/axios';
import { useNavigate } from 'react-router-dom';

export default function AddComponentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    'hero',
    'button',
    'card',
    'form',
    'navigation',
    'layout',
    'modal',
    'input',
    'display',
    'feedback',
    'other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Component name is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get token from localStorage
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { data } = await api.post('/components', {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        code: '// Start building your component here\nfunction MyComponent() {\n  return (\n    <div className="p-4">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default MyComponent;',
        defaultProps: []
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        description: ''
      });
      
      // Close modal
      onClose();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
     
      // Navigate to code editor with the new component
      navigate(`/admin/code/${data.data.component._id}`);
      
    } catch (err) {
      if (err.message === 'No authentication token found') {
        setError('Please login to create components');
        navigate('/admin/login'); // Redirect to login page
      } else {
        setError(err.response?.data?.message || 'Failed to create component');
        console.error('Create component error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        category: '',
        description: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Component</h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {/* Component Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Component Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., CustomButton, UserCard"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  disabled={loading}
                  required
                />
              </div>
              
              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  disabled={loading}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of what this component does..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  disabled={loading}
                />
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create & Edit
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}