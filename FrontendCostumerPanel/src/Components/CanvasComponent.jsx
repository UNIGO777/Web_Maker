import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, Monitor, Tablet, Smartphone } from 'lucide-react';
import * as Babel from '@babel/standalone';

const CanvasComponent = ({ component, isSelected, onSelect, onRemove }) => {
  const [deviceMode, setDeviceMode] = useState('desktop'); // desktop, tablet, mobile
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Render component using iframe like LivePreview
  useEffect(() => {
    if (!iframeRef.current || !component.code) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    try {
      // Prepare props object
      const props = {};
      if (component.currentProps && Array.isArray(component.currentProps)) {
        component.currentProps.forEach(prop => {
          if (prop.key && prop.value !== undefined) {
            try {
              if (prop.type === 'object' && typeof prop.value === 'string') {
                props[prop.key] = JSON.parse(prop.value);
              } else if (prop.type === 'array' && typeof prop.value === 'string') {
                props[prop.key] = JSON.parse(prop.value);
              } else if (prop.type === 'boolean') {
                props[prop.key] = Boolean(prop.value);
              } else if (prop.type === 'number') {
                props[prop.key] = Number(prop.value);
              } else {
                props[prop.key] = prop.value;
              }
            } catch (e) {
              console.warn(`Error parsing prop ${prop.key}:`, e);
              props[prop.key] = prop.value;
            }
          }
        });
      }

      // Create HTML content for iframe similar to LivePreview
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Component Preview</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              margin: 0;
              padding: 4px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: white;
            }
            .component-container {
              min-height: 50px;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div id="root" class="component-container"></div>
          <script>
            window.addEventListener('load', function() {
              window.React = React;
              window.ReactDOM = ReactDOM;
              
              const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue } = React;
            
              const componentProps = ${JSON.stringify(props)};
              const props = componentProps;
              
              let componentCode = \`${component.code}\`;
              
              const rootElement = document.getElementById('root');
              let root;
              if (ReactDOM.createRoot) {
                root = ReactDOM.createRoot(rootElement);
              } else {
                root = {
                  render: (element) => ReactDOM.render(element, rootElement)
                };
              }
              
              try {
                let compiledCode;
                if (componentCode.includes('<') && componentCode.includes('>')) {
                  compiledCode = Babel.transform(componentCode, {
                    presets: ['react']
                  }).code;
                } else {
                  compiledCode = componentCode;
                }
                
                eval(compiledCode);
                
                const hasRenderCall = \`${component.code}\`.includes('root.render') || \`${component.code}\`.includes('ReactDOM.render');
                
                if (!hasRenderCall) {
                  const functionMatch = \`${component.code}\`.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=)/);
                  const componentName = functionMatch ? (functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4]) : 'MyComponent';
                  
                  if (window[componentName] && typeof window[componentName] === 'function') {
                    root.render(React.createElement(window[componentName], componentProps));
                  } else {
                    const fallbackName = '${component.name}'.replace(/\s+/g, '');
                    if (window[fallbackName] && typeof window[fallbackName] === 'function') {
                      root.render(React.createElement(window[fallbackName], componentProps));
                    } else {
                      root.render(
                        React.createElement('div', {
                          className: 'bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-700'
                        }, 
                          React.createElement('div', { className: 'font-medium text-sm' }, 'Component Preview'),
                          React.createElement('div', { className: 'text-xs mt-1' }, 'Component code executed successfully. If no preview appears, ensure your component includes a render call.')
                        )
                      );
                    }
                  }
                }
              } catch (error) {
                console.error('Error compiling or executing component code:', error);
                if (root) {
                  root.render(
                    React.createElement('div', {
                      className: 'bg-red-50 border border-red-200 rounded p-2 text-red-700'
                    }, 
                      React.createElement('div', { className: 'font-medium text-sm' }, 'Component Error'),
                      React.createElement('div', { className: 'text-xs mt-1' }, error.message)
                    )
                  );
                }
              }
            });
          </script>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    } catch (error) {
      console.error('Error setting up iframe:', error);
    }
  }, [component.code, component.currentProps]);

  const getDeviceStyles = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '300px' };
      case 'tablet':
        return { width: '768px', height: '250px' };
      case 'desktop':
      default:
        return { width: '100%', height: '200px' };
    }
  };

  const renderComponentPreview = () => {
    const deviceStyles = getDeviceStyles();
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-700">Preview:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Desktop View"
              >
                <Monitor size={14} />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1 rounded ${deviceMode === 'tablet' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Tablet View"
              >
                <Tablet size={14} />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                title="Mobile View"
              >
                <Smartphone size={14} />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {deviceMode === 'desktop' && 'Desktop'}
            {deviceMode === 'tablet' && '768px'}
            {deviceMode === 'mobile' && '375px'}
          </div>
        </div>
        
        <div className="p-2 bg-gray-100 flex justify-center">
          <div 
            className="bg-white rounded shadow-sm overflow-hidden"
            style={deviceStyles}
          >
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title={`Preview of ${component.name}`}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`w-full group ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative">
        {renderComponentPreview()}
        
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 rounded-lg pointer-events-none" />
        )}
        
        <div className={`absolute -top-6 right-0 flex space-x-1 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="p-1 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 transition-colors"
            title="Edit Properties"
          >
            <Edit size={12} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1 bg-red-600 text-white rounded shadow-sm hover:bg-red-700 transition-colors"
            title="Remove Component"
          >
            <Trash2 size={12} />
          </button>
        </div>
        
        <div className={`absolute -bottom-5 left-0 text-xs bg-gray-800 text-white px-2 py-0.5 rounded transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {component.name}
        </div>
      </div>
    </div>
  );
};

export default CanvasComponent;