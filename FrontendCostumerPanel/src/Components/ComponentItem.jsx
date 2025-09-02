import React, { useState } from 'react';
import { Eye, Plus, Edit, Image as ImageIcon } from 'lucide-react';


const ComponentItem = ({ component, onSelect, onEdit, isUsed = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category) => {
    const colors = {
      hero: 'bg-purple-100 text-purple-800',
      about: 'bg-blue-100 text-blue-800',
      footer: 'bg-green-100 text-green-800',
      navigation: 'bg-orange-100 text-orange-800',
      contact: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.general;
  };
    const Backend_url = import.meta.env.VITE_BACKEND_URL;

  const handleSelect = (e) => {
    e.stopPropagation();
    if (isUsed) {
      return; // Prevent selection if already used
    }
    if (onSelect) {
      onSelect(component);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(component);
    }
  };

  return (
    <div
      className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
        isUsed 
          ? 'border-gray-300 opacity-60 cursor-not-allowed' 
          : 'border-gray-200 cursor-pointer hover:shadow-lg transform hover:scale-105'
      }`}
      onMouseEnter={() => !isUsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Large Preview Thumbnail */}
      <div className="relative w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {component.thumbnail ? (
          <img
                      src={`${Backend_url}${component.thumbnail}`}
                      alt={component.name}
                      className="w-full h-full object-contain  group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      crossOrigin="anonymous"
                    />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center ${component.thumbnail ? 'hidden' : 'flex'}`}
          style={{ display: component.thumbnail ? 'none' : 'flex' }}
        >
          <ImageIcon className="text-gray-400" size={32} />
        </div>
        
        {/* Hover Overlay */}
        {isHovered && !isUsed && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  onClick={handleEdit}
                  className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Edit Component"
                >
                  <Eye size={16} />
                </button>
              )}
              <button 
                onClick={handleSelect}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                title="Add to Canvas"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
        
        {/* Used Component Overlay */}
        {isUsed && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-gray-700">Already Used</span>
            </div>
          </div>
        )}
      </div>

      {/* Component Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
            {component.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(component.category)}`}>
            {component.category}
          </span>
        </div>
        
        {component.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {component.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs ${
            isUsed ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {isUsed ? 'Already used' : 'Click to add to canvas'}
          </span>
          
          {component.defaultProps && component.defaultProps.length > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              {component.defaultProps.length} prop{component.defaultProps.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentItem;