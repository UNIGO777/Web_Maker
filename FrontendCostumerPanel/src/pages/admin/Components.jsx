import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Code,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../lib/axios';
import AddComponentModal from '../../components/admin/AddComponentModal';
import { toast } from 'react-hot-toast';
export default function Components() {
  const [components, setComponents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const Backend_url = import.meta.env.VITE_BACKEND_URL;

  // console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
  // Fetch components
  const fetchComponents = async (page = 1, search = '', category = 'all') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(category !== 'all' && { category })
      };
      
      const { data } = await api.get('/components', { params });
      setComponents(data.data.components);
      setTotalPages(data.data.pagination.pages);
      setCurrentPage(data.data.pagination.current);
    } catch (err) {
      setError('Failed to fetch components');
      console.error('Fetch components error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/components/categories');
      setCategories(data.data.categories);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  // Delete component
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this component?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await api.delete(`/components/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Component deleted successfully');
      fetchComponents(currentPage, searchTerm, selectedCategory);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Please login to delete components');
      } else {
        toast.error('Failed to delete component');
        console.error('Delete component error:', err);
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    fetchComponents(1, value, selectedCategory);
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchComponents(1, searchTerm, category);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchComponents(page, searchTerm, selectedCategory);
  };

  // Handle component creation success
  const handleComponentCreated = () => {
    fetchComponents(currentPage, searchTerm, selectedCategory);
    fetchCategories();
  };

  useEffect(() => {
    fetchComponents();
    fetchCategories();
  }, []);

  if (loading && components.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Components</h1>
          <p className="text-gray-600">Manage your reusable components</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search components..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Add Component Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              Add Component
            </motion.button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <AnimatePresence>
            {components.map((component) => (
              <motion.div
                key={component._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl  border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Component Preview */}
                <div className="h-[200px] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative group">
                  {component.thumbnail ? (
                    <img
                      src={`${Backend_url}${component.thumbnail}`}
                      alt={component.name}
                      className="w-full h-full object-contain  group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 w-full h-full flex items-center justify-center">
                      <Code className="text-primary/60" size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="text-xs bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full font-medium shadow-sm">
                      {component.category}
                    </span>
                  </div>
                </div>

                {/* Component Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 truncate">
                    {component.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
                    {component.description || 'No description provided'}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedComponent(component)}
                      className="flex-1 bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 border border-gray-200"
                    >
                      <Eye size={18} />
                      Preview
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.open(`/admin/code/${component._id}`, '_blank')}
                      className="flex-1 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Edit size={18} />
                      Edit
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDelete(component._id)}
                      className="bg-white text-red-600 p-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors border border-red-200 flex items-center justify-center"
                      aria-label="Delete component"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {!loading && components.length === 0 && (
          <div className="text-center py-12">
            <Code className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first component'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              Add Your First Component
            </motion.button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Add Component Modal */}
      <AddComponentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleComponentCreated}
      />
    </div>
  );
}