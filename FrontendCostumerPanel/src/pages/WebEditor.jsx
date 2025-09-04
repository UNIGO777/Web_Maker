import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SidePanel from '../Components/SidePanel';
import Canvas from '../Components/Canvas';
import DynamicFormBuilder from '../Components/DynamicFormBuilder';
import ComponentEditor from '../Components/ComponentEditor';
import AnimatedLoader from '../Components/AnimatedLoader';
import useAuthStore from '../Stores/AuthenticationStore';
import { X, Save, Eye, Undo, Redo, Menu, ChevronUp, ChevronDown } from 'lucide-react';
import useComponentStore from '../Stores/ComponentStore';


const WebEditor = () => {
  const { id: projectId } = useParams();
  const { token } = useAuthStore();
  const [website, setWebsite] = useState(null);
  const [components, setComponents] = useState([]);
  const [canvasComponents, setCanvasComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPropsPanel, setShowPropsPanel] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [editingComponent, setEditingComponent] = useState(null);

  
  const {fetchComponents} = useComponentStore();



  // Fetch website data and components from backend
  useEffect(() => {
    if (projectId) {
      fetchWebsiteData();
    }
    const fetchComponentsData = async () => {
      const components = await fetchComponents();
      setComponents(components);
    };
    
    fetchComponentsData();

  }, [projectId]);

  // Fetch website data including components
  const fetchWebsiteData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/websites/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch website data');
      }
      
      const data = await response.json();
      const websiteData = data.data.website;
      
      // Set website data
      setWebsite(websiteData);


      
      // Set available components from website data
      if (websiteData.components && websiteData.components.length > 0) {
        
        
        // Convert existing components to canvas components and display them
        const existingCanvasComponents = websiteData.components.map((component, index) => ({
          id: `${component._id}_${Date.now()}_${index}`,
          componentId: component._id,
          name: component.name,
          code: component.code,
          defaultProps: component.defaultProps || [],
          currentProps: component.defaultProps || [],
          position: { x: 100 + (index * 50), y: 100 + (index * 50) },
          styles: component.styles || {},
          sequence: component.sequence || index
        }));
        
        setCanvasComponents(existingCanvasComponents);
        addToHistory(existingCanvasComponents);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching website data:', err);
    } finally {
      setLoading(false);
    }
  };



  // Get used component IDs
  const getUsedComponentIds = () => {
    return canvasComponents.map(comp => comp.componentId);
  };

  // Add component to canvas
  const addComponentToCanvas = (component, position = { x: 100, y: 100 }) => {
    // Check if component is already used
    const usedIds = getUsedComponentIds();
    if (usedIds.includes(component._id || component.componentId)) {
      alert('This component has already been used and can only be used once.');
      return;
    }

    const newComponent = {
      id: `${component._id || component.componentId}_${Date.now()}`,
      componentId: component._id || component.componentId,
      name: component.name,
      code: component.code,
      defaultProps: component.defaultProps || [],
      currentProps: component.defaultProps || [],
      position: position,
      styles: component.styles || {},
      sequence: canvasComponents.length
    };
    
    const newCanvasComponents = [...canvasComponents, newComponent];
    setCanvasComponents(newCanvasComponents);
    addToHistory(newCanvasComponents);
    
    // Automatically select the newly added component for immediate editing
    setSelectedComponent(newComponent);
    setShowPropsPanel(true);
  };

  // Make addComponentToCanvas available globally for Canvas component
  React.useEffect(() => {
    window.addComponentToCanvas = (component) => {
      const newCanvasComponents = [...canvasComponents, component];
      setCanvasComponents(newCanvasComponents);
      addToHistory(newCanvasComponents);
    };
    
    return () => {
      delete window.addComponentToCanvas;
    };
  }, [canvasComponents]);

  // Update component props
  const updateComponentProps = (componentId, newProps) => {
    const updatedComponents = canvasComponents.map(comp => 
      comp.id === componentId 
        ? { ...comp, currentProps: newProps }
        : comp
    );
    setCanvasComponents(updatedComponents);
    addToHistory(updatedComponents);
    
    // Update selectedComponent to reflect the changes immediately
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent({ ...selectedComponent, currentProps: newProps });
    }
  };

  // Move component up in sequence
  const moveComponentUp = (componentId) => {
    const componentIndex = canvasComponents.findIndex(comp => comp.id === componentId);
    if (componentIndex > 0) {
      const updatedComponents = [...canvasComponents];
      const temp = updatedComponents[componentIndex].sequence;
      updatedComponents[componentIndex].sequence = updatedComponents[componentIndex - 1].sequence;
      updatedComponents[componentIndex - 1].sequence = temp;
      
      // Swap positions in array
      [updatedComponents[componentIndex], updatedComponents[componentIndex - 1]] = 
      [updatedComponents[componentIndex - 1], updatedComponents[componentIndex]];
      
      setCanvasComponents(updatedComponents);
      addToHistory(updatedComponents);
    }
  };

  // Move component down in sequence
  const moveComponentDown = (componentId) => {
    const componentIndex = canvasComponents.findIndex(comp => comp.id === componentId);
    if (componentIndex < canvasComponents.length - 1) {
      const updatedComponents = [...canvasComponents];
      const temp = updatedComponents[componentIndex].sequence;
      updatedComponents[componentIndex].sequence = updatedComponents[componentIndex + 1].sequence;
      updatedComponents[componentIndex + 1].sequence = temp;
      
      // Swap positions in array
      [updatedComponents[componentIndex], updatedComponents[componentIndex + 1]] = 
      [updatedComponents[componentIndex + 1], updatedComponents[componentIndex]];
      
      setCanvasComponents(updatedComponents);
      addToHistory(updatedComponents);
    }
  };

  // Handle drag and drop component reordering
  const handleComponentMove = (dragIndex, hoverIndex) => {
    const updatedComponents = [...canvasComponents];
    const draggedComponent = updatedComponents[dragIndex];
    
    // Remove the dragged component from its current position
    updatedComponents.splice(dragIndex, 1);
    // Insert it at the new position
    updatedComponents.splice(hoverIndex, 0, draggedComponent);
    
    // Update sequence numbers to match new positions
    updatedComponents.forEach((comp, index) => {
      comp.sequence = index;
    });
    
    setCanvasComponents(updatedComponents);
    addToHistory(updatedComponents);
  };

  // Remove component from canvas
  const removeComponentFromCanvas = (componentId) => {
    const updatedComponents = canvasComponents.filter(comp => comp.id !== componentId);
    setCanvasComponents(updatedComponents);
    addToHistory(updatedComponents);
    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
      setShowPropsPanel(false);
    }
  };

  // History management
  const addToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(state)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasComponents(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasComponents(history[historyIndex + 1]);
    }
  };

  // Select component for editing
  const selectComponent = (component) => {
    setSelectedComponent(component);
    setShowPropsPanel(true);
  };

  // Edit component in ComponentEditor
  const editComponent = (component) => {
    setEditingComponent(component);
  };

  // Handle component save from editor
  const handleComponentSave = async (updatedComponent) => {
    try {
      // Update the component in the components list
      setComponents(prev => 
        prev.map(comp => 
          comp._id === updatedComponent._id ? updatedComponent : comp
        )
      );
      
      // Close the editor
      setEditingComponent(null);
      
      // You can add API call here to save to backend
      console.log('Component saved:', updatedComponent);
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  // Save website
  const saveWebsite = async () => {
    try {
      if (!website || !website._id) {
        alert('Website data not loaded. Please refresh the page.');
        return;
      }

      setSaving(true);
      
      // Prepare website update data with canvas components sorted by sequence
      const sortedComponents = [...canvasComponents].sort((a, b) => a.sequence - b.sequence);
      const websiteUpdateData = {
        components: sortedComponents.map(comp => ({
          _id: comp.componentId,
          name: comp.name,
          code: comp.code,
          defaultProps: comp.currentProps || comp.defaultProps,
          category: comp.category || 'general',
          sequence: comp.sequence
        }))
      };

      const response = await fetch(`http://localhost:5001/api/websites/${website._id}/components`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(websiteUpdateData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save website');
      }
      
      const data = await response.json();
      console.log('Website saved successfully:', data);
      alert('Website saved successfully!');
      
    } catch (err) {
      console.error('Error saving website:', err);
      alert('Failed to save website: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Preview website
  const previewWebsite = () => {
    // Implementation for preview
    console.log('Previewing website...', canvasComponents);
  };

  const filteredComponents = (components || []).filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading screen during initial load
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <AnimatedLoader />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 pt-16">
      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center">
            <AnimatedLoader />
            <p className="mt-4 text-gray-600 font-medium">Saving your website...</p>
          </div>
        </div>
      )}
        {/* Side Panel */}
        {showSidePanel && (
          <div className="md:relative absolute inset-0 md:inset-auto z-30 md:z-auto">
            <SidePanel
              components={filteredComponents}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onComponentSelect={addComponentToCanvas}
              onComponentEdit={editComponent}
              loading={loading}
              error={error}
              onClose={() => setShowSidePanel(false)}
              usedComponentIds={getUsedComponentIds()}
            />
          </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-2 md:px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-1 md:space-x-2">
              {!showSidePanel && (
                <button
                  onClick={() => setShowSidePanel(true)}
                  className="p-1.5 md:p-2 text-gray-600 hover:text-gray-800"
                  title="Show Components Panel"
                >
                  <Menu size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              )}
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
            
            <h1 className="text-sm md:text-lg font-semibold text-gray-800">Web Editor</h1>
            
            <div className="flex items-center space-x-1 md:space-x-2">
              
              <button
                onClick={saveWebsite}
                className="px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1 md:space-x-2 text-sm md:text-base"
              >
                <Save size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Canvas and Props Panel Container */}
          <div className="flex-1 flex">
            {/* Canvas */}
            <div className={`flex-1 ${showPropsPanel ? 'md:mr-80' : ''} transition-all duration-300`}>
              <Canvas
                components={canvasComponents}
                onComponentSelect={selectComponent}
                onComponentRemove={removeComponentFromCanvas}
                onComponentMove={handleComponentMove}
                onComponentMoveUp={moveComponentUp}
                onComponentMoveDown={moveComponentDown}
                selectedComponent={selectedComponent}
              />
            </div>

            {/* Props Panel */}
            {showPropsPanel && selectedComponent && (
              <div className="w-full md:w-80 bg-white border-l border-gray-200 fixed right-0 top-0 h-full overflow-y-auto z-20 md:z-10">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Edit {selectedComponent.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/* Sequence Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveComponentUp(selectedComponent.id)}
                        disabled={canvasComponents.findIndex(comp => comp.id === selectedComponent.id) === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveComponentDown(selectedComponent.id)}
                        disabled={canvasComponents.findIndex(comp => comp.id === selectedComponent.id) === canvasComponents.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowPropsPanel(false);
                        setSelectedComponent(null);
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="space-y-4">
                    {selectedComponent.currentProps && selectedComponent.currentProps.length > 0 ? (
                      <>
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              setShowPropsPanel(false);
                              setSelectedComponent(null);
                            }}
                            className="p-1 text-gray-500 hover:text-gray-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {selectedComponent.currentProps.map((prop, index) => (
                          <div key={index} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              {prop.key || `Property ${index + 1}`}
                            </label>
                            <DynamicFormBuilder
                              value={prop.value}
                              onChange={(newValue) => {
                                const updatedProps = [...selectedComponent.currentProps];
                                updatedProps[index] = { ...prop, value: newValue };
                                updateComponentProps(selectedComponent.id, updatedProps);
                              }}
                              type={prop.type || 'string'}
                            />
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        No editable properties available for this component.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Component Editor Modal */}
        {editingComponent && (
          <ComponentEditor
            component={editingComponent}
            onClose={() => setEditingComponent(null)}
            onSave={handleComponentSave}
          />
        )}
    </div>
  );
};

export default WebEditor;