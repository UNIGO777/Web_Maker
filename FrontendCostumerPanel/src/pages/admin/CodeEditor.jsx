import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Save, Play, Plus, Trash2, ArrowLeft, Settings, Camera, Code, Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import LivePreview from "./LivePreview";
import DynamicFormBuilder from "../../Components/DynamicFormBuilder";
import api from "../../lib/axios";
import html2canvas from "html2canvas";

export default function AdminEditor() {
  const { component_id: componentId } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [component, setComponent] = useState(null);
  const [code, setCode] = useState('');
  const [props, setProps] = useState([]);
  const [useStateHooks, setUseStateHooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [renderComplete, setRenderComplete] = useState(false);
  const [showPropsPanel, setShowPropsPanel] = useState(false);
  const [newProp, setNewProp] = useState({ key: '', value: '', type: 'string' });
  const [newUseState, setNewUseState] = useState({ name: '', initialValue: '', type: 'string' });
  const [viewMode, setViewMode] = useState('split'); // 'code', 'preview', 'split'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop', 'tablet', 'mobile'

  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'string': return '';
      case 'number': return '0';
      case 'boolean': return 'false';
      case 'object': return '{}';
      case 'array': return '[]';
      default: return '';
    }
  };

  // Load component data
  useEffect(() => {
    if (componentId) {
      loadComponent();
    } else {
      // Default code for new components
      setCode(`// Start building your component here
function MyComponent() {
  return (
    <div className="p-4">
      <h1>Hello World!</h1>
    </div>
  );
}

// Render the component
root.render(<MyComponent {...props} />);`);
      setProps([]);
      setLoading(false);
    }
  }, [componentId]);

  // Reset render complete state when code, props, or useState hooks change
  useEffect(() => {
    setRenderComplete(false);
  }, [code, props, useStateHooks]);

  // Rest of the component remains the same...
  const loadComponent = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/components/${componentId}`);
      setComponent(data.data.component);
      setCode(data.data.component.code.replace(/export default MyComponent;/g, 'root.render(<MyComponent {...props} />)'));
     
      setProps(data.data.component.defaultProps || []);
      setUseStateHooks(data.data.component.useStateHooks || []);
    } catch (err) {
      setError('Failed to load component');
      console.error('Load component error:', err);
    } finally {
      setLoading(false);
    }
  };

  // All other functions and JSX remain exactly the same
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const captureScreenshot = async () => {
    console.log('captureScreenshot: Starting...');
    if (!previewRef.current) {
      console.error('captureScreenshot: previewRef.current is null');
      return null;
    }

    try {
      const iframe = previewRef.current.querySelector('iframe');
      if (!iframe) {
        console.error('captureScreenshot: Iframe not found');
        return null;
      }
      console.log('captureScreenshot: Iframe found');

      // Wait for the iframe content to fully render
      console.log('captureScreenshot: Render complete status:', renderComplete);
      if (!renderComplete) {
        console.log('captureScreenshot: Waiting for render to complete...');
        await new Promise(resolve => {
          const checkRender = () => {
            if (renderComplete) {
              console.log('captureScreenshot: Render completed!');
              resolve();
            } else {
              setTimeout(checkRender, 50);
            }
          };
          checkRender();
        });
      }
      
      // Additional delay to ensure everything is painted
      console.log('captureScreenshot: Waiting additional 500ms for painting...');
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('captureScreenshot: Starting html2canvas on iframe content...');
      
      // Try to access iframe content document
      let targetElement = iframe;
      let useIframeContent = false;
      
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc && iframeDoc.body) {
          // Check if the body has actual content
          const rootElement = iframeDoc.getElementById('root');
          if (rootElement && rootElement.children.length > 0) {
            targetElement = rootElement;
            useIframeContent = true;
            console.log('captureScreenshot: Using iframe root element as target');
          } else {
            console.log('captureScreenshot: Root element empty, using iframe element');
          }
        } else {
          console.log('captureScreenshot: Cannot access iframe content, using iframe element');
        }
      } catch (e) {
        console.log('captureScreenshot: Cross-origin restriction, using iframe element');
      }

      // Capture the target element with optimized settings
      const canvas = await html2canvas(targetElement, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: true,
        removeContainer: true,
        imageTimeout: 15000,
        width: useIframeContent ? undefined : iframe.offsetWidth,
        height: useIframeContent ? undefined : iframe.offsetHeight,
        scrollX: 0,
        scrollY: 0
      });
      console.log('captureScreenshot: html2canvas completed, canvas size:', canvas.width, 'x', canvas.height);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          console.log('captureScreenshot: Blob created, size:', blob ? blob.size : 'null');
          resolve(blob);
        }, 'image/png', 0.8);
      });
    } catch (error) {
      console.error('captureScreenshot: Error occurred:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!componentId) return;

    try {
      setSaving(true);
      setError('');

      // Capture screenshot
      console.log('Starting screenshot capture...');
      const thumbnail = await captureScreenshot();
      console.log('Screenshot captured:', thumbnail ? 'Success' : 'Failed');

      // Prepare form data
      const formData = new FormData();
      formData.append('name', component?.name || 'Untitled Component');
      formData.append('code', code);
      formData.append('defaultProps', JSON.stringify(props));
      formData.append('useStateHooks', JSON.stringify(useStateHooks));

      if (thumbnail) {
        formData.append('thumbnail', thumbnail, `component-${componentId}-thumbnail.png`);
        console.log('Thumbnail added to FormData');
      } else {
        console.warn('No thumbnail captured, proceeding without thumbnail');
      }

      const AdminToken = localStorage.getItem('adminToken')

      console.log('Sending request to backend...');
      await api.put(`/components/${componentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${AdminToken}`
        }
      });

      console.log('Component saved successfully');
      // Show success message
      setError('');
    } catch (err) {
      setError('Failed to save component');
      console.error('Save component error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProp = () => {
    if (!newProp.key.trim()) return;

    const propToAdd = {
      ...newProp,
      value: newProp.value || getDefaultValueForType(newProp.type)
    };

    const updatedProps = [...props, propToAdd];
    setProps(updatedProps);
    setNewProp({ key: '', value: '', type: 'string' });
  };

  const handleUpdateProp = (index, field, value) => {
    const updatedProps = [...props];
    updatedProps[index][field] = value;
    setProps(updatedProps);
  };

  const handleDeleteProp = (index) => {
    const updatedProps = props.filter((_, i) => i !== index);
    setProps(updatedProps);
  };

  // useState Hook Management Functions
  const handleAddUseState = () => {
    if (!newUseState.name.trim()) return;

    const hookToAdd = {
      ...newUseState,
      initialValue: newUseState.initialValue || getDefaultValueForType(newUseState.type)
    };

    const updatedHooks = [...useStateHooks, hookToAdd];
    setUseStateHooks(updatedHooks);
    setNewUseState({ name: '', initialValue: '', type: 'string' });
  };

  const handleUpdateUseState = (index, field, value) => {
    const updatedHooks = [...useStateHooks];
    updatedHooks[index][field] = value;
    setUseStateHooks(updatedHooks);
  };

  const handleDeleteUseState = (index) => {
    const updatedHooks = useStateHooks.filter((_, i) => i !== index);
    setUseStateHooks(updatedHooks);
  };

  const getPropsObject = () => {
    const propsObj = {};
    
    // Add regular props
    props.forEach(prop => {
      let value = prop.value;
      try {
        if (prop.type === 'number') {
          value = parseFloat(prop.value) || 0;
        } else if (prop.type === 'boolean') {
          value = prop.value === 'true';
        } else if (prop.type === 'object' || prop.type === 'array') {
          value = typeof prop.value === 'string' ? JSON.parse(prop.value) : prop.value;
        }
      } catch (e) {
        console.warn(`Failed to parse prop ${prop.key}:`, e);
      }
      propsObj[prop.key] = value;
    });

    // Add useState hooks
     const useStateObj = {};
     useStateHooks.forEach(hook => {
       let initialValue = hook.initialValue;
       try {
         if (hook.type === 'number') {
           initialValue = parseFloat(hook.initialValue) || 0;
         } else if (hook.type === 'boolean') {
           initialValue = hook.initialValue === 'true';
         } else if (hook.type === 'object' || hook.type === 'array') {
           initialValue = typeof hook.initialValue === 'string' ? JSON.parse(hook.initialValue) : hook.initialValue;
         }
       } catch (e) {
         console.warn(`Failed to parse useState hook ${hook.name}:`, e);
       }
       useStateObj[hook.name] = initialValue;
     });

     // Add useState hooks to props object
     if (Object.keys(useStateObj).length > 0) {
       propsObj.useStateHooks = useStateObj;
     }

     return propsObj;
   };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/components')}
              className="p-2 hover:bg-gray-100/80 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {component ? component.name : 'Code Editor'}
              </h1>
              <p className="text-gray-500 text-sm">
                {component ? `Category: ${component.category}` : 'Create and edit React components'}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('code')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'code' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                title="Code Only"
              >
                <Code size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('split')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                title="Split View"
              >
                <Monitor size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('preview')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                title="Preview Only"
              >
                <Eye size={18} />
              </motion.button>
            </div>

            {/* Device Preview Toggle */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className="bg-gray-100/80 p-1 rounded-xl flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-2 rounded-lg transition-all duration-200 ${previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Desktop View"
                >
                  <Monitor size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-2 rounded-lg transition-all duration-200 ${previewDevice === 'tablet' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Tablet View"
                >
                  <Tablet size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-2 rounded-lg transition-all duration-200 ${previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Mobile View"
                >
                  <Smartphone size={16} />
                </motion.button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPropsPanel(!showPropsPanel)}
              className={`p-2 rounded-xl transition-all duration-200 relative ${showPropsPanel ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100/80 text-gray-600 shadow-sm'}`}
              title="Component Props"
            >
              <Settings size={20} />
              {viewMode === 'code' && showPropsPanel && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </motion.button>

            {componentId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save size={16} />
                )}
                {saving ? 'Saving...' : 'Save'}
              </motion.button>
            )}
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 rounded-xl text-sm shadow-sm"
          >
            {error}
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Props Panel - Always available but conditionally positioned */}
        {showPropsPanel && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`
              ${viewMode === 'code' ? 'fixed top-20 right-4 z-50 w-80 max-h-[calc(100vh-6rem)] bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl' : 'w-80 bg-white border-r border-gray-200 '} 
              flex flex-col
            `}
          >
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Settings size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Component Props</h3>
                    <p className="text-xs text-gray-500">Configure component properties</p>
                  </div>
                </div>
                {viewMode === 'code' && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPropsPanel(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    <Settings size={16} />
                  </motion.button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Existing Props */}
              <div className="space-y-4 mb-6">
                {props.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <h4 className="text-sm font-semibold text-gray-700">Active Props ({props.length})</h4>
                  </div>
                )}
                {props.map((prop, index) => (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                          <Code size={12} className="text-blue-600" />
                        </div>
                        <input
                          type="text"
                          value={prop.key}
                          onChange={(e) => handleUpdateProp(index, 'key', e.target.value)}
                          className="font-semibold text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Property name"
                        />
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <select
                          value={prop.type}
                          onChange={(e) => {
                            const newType = e.target.value;
                            handleUpdateProp(index, 'type', newType);
                            handleUpdateProp(index, 'value', getDefaultValueForType(newType));
                          }}
                          className="text-xs font-medium bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="object">Object</option>
                          <option value="array">Array</option>
                        </select>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteProp(index)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all duration-200"
                          title="Remove property"
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <label className="block text-xs font-medium text-gray-600 mb-2">Value</label>
                      {prop.type === 'object' || prop.type === 'array' ? (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <DynamicFormBuilder
                            value={prop.value}
                            onChange={(newValue) => handleUpdateProp(index, 'value', newValue)}
                            type={prop.type}
                          />
                        </div>
                      ) : prop.type === 'boolean' ? (
                        <select
                          value={prop.value}
                          onChange={(e) => handleUpdateProp(index, 'value', e.target.value)}
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="true">✓ true</option>
                          <option value="false">✗ false</option>
                        </select>
                      ) : (
                        <input
                          type={prop.type === 'number' ? 'number' : 'text'}
                          value={prop.value}
                          onChange={(e) => handleUpdateProp(index, 'value', e.target.value)}
                          className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder={`Enter ${prop.type} value`}
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* useState Hooks Section */}
              

              {/* Add New Prop */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Plus size={16} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Add New Property</h4>
                    <p className="text-xs text-gray-500">Create a new component prop</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Property Name</label>
                    <input
                      type="text"
                      value={newProp.key}
                      onChange={(e) => setNewProp({ ...newProp, key: e.target.value })}
                      className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
                      placeholder="Enter property name (e.g., title, count)"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Data Type</label>
                    <select
                      value={newProp.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setNewProp({ 
                          ...newProp, 
                          type: newType,
                          value: getDefaultValueForType(newType)
                        });
                      }}
                      className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
                    >
                      <option value="string">📝 String</option>
                      <option value="number">🔢 Number</option>
                      <option value="boolean">✅ Boolean</option>
                      <option value="object">📦 Object</option>
                      <option value="array">📋 Array</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Default Value</label>
                    {newProp.type === 'object' || newProp.type === 'array' ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <DynamicFormBuilder
                          value={newProp.value}
                          onChange={(newValue) => setNewProp({ ...newProp, value: newValue })}
                          type={newProp.type}
                        />
                      </div>
                    ) : newProp.type === 'boolean' ? (
                      <select
                        value={newProp.value}
                        onChange={(e) => setNewProp({ ...newProp, value: e.target.value })}
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-medium"
                      >
                        <option value="true">✓ true</option>
                        <option value="false">✗ false</option>
                      </select>
                    ) : (
                      <input
                        type={newProp.type === 'number' ? 'number' : 'text'}
                        value={newProp.value}
                        onChange={(e) => setNewProp({ ...newProp, value: e.target.value })}
                        className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400"
                        placeholder={`Enter default ${newProp.type} value`}
                      />
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddProp}
                    disabled={!newProp.key.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Plus size={16} />
                    Add Property
                  </motion.button>
                 </div>
               </div>
             </div>
          </motion.div>
        )}

        {/* Enhanced Main Content */}
        <div className="flex-1 flex gap-6 p-6 min-h-0">
          {/* Code Editor */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`${viewMode === 'split' ? 'flex-1' : 'w-full'} flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Code size={20} className="text-blue-600" />
                  Code Editor
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Editing
                </div>
              </div>
              <div className="flex-1 border border-gray-200/50 rounded-2xl overflow-hidden bg-white backdrop-blur-sm">
                <MonacoEditor
                  height="100%"
                  language="javascript"
                  value={code}
                  onChange={handleEditorChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    fontFamily: 'JetBrains Mono, Fira Code, Monaco, monospace',
                    lineHeight: 1.6,
                    padding: { top: 16, bottom: 16 }
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Live Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`${viewMode === 'split' ? 'flex-1' : 'w-full'} flex flex-col`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Eye size={20} className="text-green-600" />
                  Live Preview
                </h2>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-lg capitalize">
                    {previewDevice}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Auto Refresh
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <div className={`
                  ${previewDevice === 'mobile' ? 'w-80 h-[640px]' : 
                    previewDevice === 'tablet' ? 'w-[768px] h-[1024px] max-h-full' : 
                    'w-full h-full'}
                  border border-gray-200/50 rounded-2xl overflow-hidden shadow-md bg-white backdrop-blur-sm
                  ${previewDevice !== 'desktop' ? 'shadow-2xl border-gray-300' : ''}
                `} ref={previewRef}>
                  <LivePreview 
                    code={code} 
                    props={getPropsObject()} 
                    onRenderComplete={() => setRenderComplete(true)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}