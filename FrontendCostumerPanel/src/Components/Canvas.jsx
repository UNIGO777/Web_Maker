import React, { useRef, useState } from 'react';
import CanvasComponent from './CanvasComponent';
import WebsitePreview from './WebsitePreview';
import WebsiteExporter from '../utils/WebsiteExporter';
import { Plus, MousePointer, Maximize2, Minimize2, Eye, Edit3, Download, FileDown } from 'lucide-react';

const Canvas = ({ 
  components, 
  onComponentSelect, 
  onComponentRemove, 
  selectedComponent 
}) => {
  const canvasRef = useRef(null);
  const [canvasHeight, setCanvasHeight] = useState(1200); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  const [isExporting, setIsExporting] = useState(false);

  // Handle website export
  const handleExportWebsite = async () => {
    if (components.length === 0) {
      alert('No components to export. Please add some components first.');
      return;
    }

    setIsExporting(true);
    try {
      const exporter = new WebsiteExporter(components, 'My Website');
      const result = await exporter.exportAsZip();
      
      if (result.success) {
        alert(result.message);
      } else {
        alert('Export failed: ' + result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleResize = (e) => {
    if (!isResizing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newHeight = Math.max(600, e.clientY - rect.top);
    setCanvasHeight(newHeight);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  return (
    <div className="h-full bg-gray-100 relative overflow-auto">
      {/* View Mode Toggle */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {viewMode === 'edit' ? 'Edit Mode' : 'Website Preview'}
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'edit'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
            </div>
          </div>
          
          {/* Export Button */}
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              {components.length} component{components.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={handleExportWebsite}
              disabled={isExporting || components.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                components.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isExporting
                  ? 'bg-blue-100 text-blue-600 cursor-wait'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
              }`}
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Export Website</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {viewMode === 'preview' ? (
          /* Website Preview Mode */
          <div className="flex justify-center">
            <div className="w-full max-w-6xl bg-white shadow-2xl border border-gray-200 min-h-[600px]">
              <WebsitePreview components={components} />
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="flex justify-center">
        <div 
          ref={canvasRef}
          className="bg-white shadow-2xl relative border overflow-y-scroll border-gray-200"
          style={{ 
            width: '800px', // Fixed width like a document
            height: `700px`,
            minHeight: '600px'
          }}
        >
          {/* Canvas Content Area */}
          <div className="w-full h-full relative">
            {/* Canvas Components - Stacked Layout */}
            <div className="space-y-4 p-4">
              {components.map((component) => (
                <CanvasComponent
                  key={component.id}
                  component={component}
                  isSelected={selectedComponent?.id === component.id}
                  onSelect={() => onComponentSelect(component)}
                  onRemove={() => onComponentRemove(component.id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {components.length === 0 && (
              <div className="absolute inset-4 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                    <MousePointer className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    Start Creating Your Website
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                    Click on any component from the sidebar to add it to your canvas. 
                    Each component can be customized with its own properties and styling.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 font-medium">
                      💡 Tip: Click a component to instantly start editing its properties!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Background */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>

          {/* Resize Handle */}
          <div 
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-gray-300 hover:bg-gray-400 cursor-ns-resize flex items-center justify-center transition-colors"
            onMouseDown={handleResizeStart}
            title="Drag to resize canvas height"
          >
            <div className="w-8 h-1 bg-gray-500 rounded"></div>
          </div>
        </div>
      </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;