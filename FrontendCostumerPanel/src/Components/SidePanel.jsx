import React from 'react';
import { Search, Package, Loader, X } from 'lucide-react';
import ComponentItem from './ComponentItem';

const SidePanel = ({ 
  components, 
  searchTerm, 
  setSearchTerm, 
  onComponentSelect, 
  onComponentEdit,
  loading, 
  error,
  onClose,
  usedComponentIds = []
}) => {
  const categories = [...new Set(components.map(comp => comp.category))];
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredByCategory = selectedCategory === 'all' 
    ? components 
    : components.filter(comp => comp.category === selectedCategory);

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Components</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
              title="Close Panel"
            >
              <X size={18} />
            </button>
          )}
        </div>
        
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        
        {/* Category Filter */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={24} />
            <span className="ml-2 text-gray-600">Loading components...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2 font-medium">Error loading components</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        ) : filteredByCategory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-3" size={40} />
            <div className="text-gray-600 mb-1 font-medium">No components found</div>
            <div className="text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search' : 'No components available'}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredByCategory.map((component) => (
              <ComponentItem
                key={component._id}
                component={component}
                onSelect={onComponentSelect}
                onEdit={onComponentEdit}
                isUsed={usedComponentIds.includes(component._id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t fixed bottom-0 w-96 border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-xs text-gray-600 text-center font-medium">
          {filteredByCategory.length} component{filteredByCategory.length !== 1 ? 's' : ''} available
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          Click any component to add to canvas
        </div>
      </div>
    </div>
  );
};

export default SidePanel;