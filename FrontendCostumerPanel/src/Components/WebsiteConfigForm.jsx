import React, { useState } from 'react';
import { X, Upload, Globe, FileText, Tag } from 'lucide-react';
import api from '../lib/axios';

const WebsiteConfigForm = ({ website, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    logo: website?.logo || '',
    title: website?.title || '',
    description: website?.description || '',
    keywords: website?.keywords || [],
    canonicalUrl: website?.canonicalUrl || '',
    ogTitle: website?.ogTitle || '',
    ogDescription: website?.ogDescription || '',
    ogImage: website?.ogImage || ''
  });
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleKeywordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put(`/websites/${website._id}`, formData);
      onSave(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error updating website:', error);
      alert('Failed to update website configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Globe className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Website Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
              <FileText size={18} />
              <span>Basic Information</span>
            </h3>
            
            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <div className="relative">
                <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="My Awesome Website"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="A brief description of your website..."
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
              <Tag size={18} />
              <span>SEO Settings</span>
            </h3>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    placeholder="Add a keyword and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(keyword)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Canonical URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical URL
              </label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Open Graph Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Open Graph (Social Media)</h3>
            
            {/* OG Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Title
              </label>
              <input
                type="text"
                name="ogTitle"
                value={formData.ogTitle}
                onChange={handleInputChange}
                placeholder="Title for social media sharing"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* OG Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Description
              </label>
              <textarea
                name="ogDescription"
                value={formData.ogDescription}
                onChange={handleInputChange}
                placeholder="Description for social media sharing"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Image URL
              </label>
              <input
                type="url"
                name="ogImage"
                value={formData.ogImage}
                onChange={handleInputChange}
                placeholder="https://example.com/social-image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WebsiteConfigForm;