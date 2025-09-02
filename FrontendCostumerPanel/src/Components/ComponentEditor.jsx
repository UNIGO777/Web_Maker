import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as Babel from '@babel/standalone';
import { X, Save } from 'lucide-react';
import DynamicFormBuilder from './DynamicFormBuilder';

const ComponentEditor = ({ component, onClose, onSave }) => {
  // Removed activeTab state - now showing live preview and props panel side by side
  const [code, setCode] = useState(component?.code || '');
  const [props, setProps] = useState(component?.defaultProps || []);
  const [renderComplete, setRenderComplete] = useState(false);
  const iframeRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Initialize component data
  useEffect(() => {
    if (component) {
      setCode(component.code || '');
      setProps(component.defaultProps || []);
    }
  }, [component]);

  // Live preview rendering logic (similar to LivePreview.jsx)
  useEffect(() => {
    if (iframeRef.current && code) {
      renderPreview();
    }
  }, [code, props]);

  const renderPreview = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    try {
      let codeToCompile = code.trim() || `
        function DefaultComponent() {
          return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 
            React.createElement('h1', null, 'No code provided'),
            React.createElement('p', null, 'Please enter some React code in the editor.')
          );
        }
        if (window.root && window.root.render) {
          window.root.render(React.createElement(DefaultComponent));
        } else {
          const rootElement = document.getElementById('root');
          if (rootElement && ReactDOM && ReactDOM.render) {
            ReactDOM.render(React.createElement(DefaultComponent), rootElement);
          }
        }
      `;

      // Preprocess code to fix unsafe root.render calls
      codeToCompile = codeToCompile.replace(
        /root\.render\(([^)]+)\)/g,
        `if (window.root && window.root.render) {
          window.root.render($1);
        } else {
          const rootElement = document.getElementById('root');
          if (rootElement && ReactDOM && ReactDOM.render) {
            ReactDOM.render($1, rootElement);
          }
        }`
      );

      // Transform the code using Babel if it contains JSX
      let compiledCode;
      if (codeToCompile.includes('<') && codeToCompile.includes('>')) {
        compiledCode = Babel.transform(codeToCompile, {
          presets: ['react']
        }).code;
      } else {
        compiledCode = codeToCompile;
      }

      // Create HTML content with all necessary libraries
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            #root { width: 100%; height: 100vh; min-height: 100vh; background: white; }
          </style>
        </head>
        <body>
          <div id="root">
            <div id="loading-status" style="padding: 20px; text-align: center; color: #666; font-family: monospace; font-size: 12px;">
              <h2>Loading Libraries...</h2>
              <div id="library-status">
                <div>React: <span id="react-status">❌</span></div>
                <div>ReactDOM: <span id="reactdom-status">❌</span></div>
                <div>Lucide: <span id="lucide-status">❌</span></div>
                <div>Axios: <span id="axios-status">❌</span></div>
                <div>Lodash: <span id="lodash-status">❌</span></div>
              </div>
            </div>
          </div>
          
          <!-- Core React Libraries -->
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          
          <!-- Popular React Libraries -->
          <script crossorigin src="https://unpkg.com/axios@1.6.0/dist/axios.min.js"></script>
          <script crossorigin src="https://unpkg.com/lodash@4.17.21/lodash.min.js"></script>
          
          <!-- Lucide Icons -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
          
          <script>
            let librariesLoaded = {
              react: false,
              reactdom: false,
              lucide: false,
              axios: false,
              lodash: false
            };

            function updateLibraryStatus(library, loaded) {
              librariesLoaded[library] = loaded;
              const statusElement = document.getElementById(library + '-status');
              if (statusElement) {
                statusElement.textContent = loaded ? '✅' : '❌';
              }
              
              // Check if all libraries are loaded
              const allLoaded = Object.values(librariesLoaded).every(status => status);
              if (allLoaded) {
                executeCode();
              }
            }

            // Check library loading
            function checkLibraries() {
              updateLibraryStatus('react', typeof React !== 'undefined');
              updateLibraryStatus('reactdom', typeof ReactDOM !== 'undefined');
              updateLibraryStatus('lucide', typeof lucide !== 'undefined');
              updateLibraryStatus('axios', typeof axios !== 'undefined');
              updateLibraryStatus('lodash', typeof _ !== 'undefined');
            }

            // Execute the compiled code
            function executeCode() {
              try {
                // Make libraries globally available
                if (typeof React !== 'undefined') {
                  window.React = React;
                  window.useState = React.useState;
                  window.useEffect = React.useEffect;
                  window.useRef = React.useRef;
                  window.useMemo = React.useMemo;
                  window.useCallback = React.useCallback;
                  window.useContext = React.useContext;
                  window.createElement = React.createElement;
                }
                
                if (typeof ReactDOM !== 'undefined') {
                  window.ReactDOM = ReactDOM;
                  const rootElement = document.getElementById('root');
                  if (rootElement && ReactDOM.createRoot) {
                    window.root = ReactDOM.createRoot(rootElement);
                  }
                }
                
                // Make other libraries available
                if (typeof lucide !== 'undefined') window.lucide = lucide;
                if (typeof axios !== 'undefined') window.axios = axios;
                if (typeof _ !== 'undefined') window._ = _;
                
                // Make props available globally
                window.props = ${JSON.stringify(convertPropsToObject(props))};
                
                // Execute the compiled code with proper error handling
                try {
                  ${compiledCode}
                } catch (renderError) {
                  console.error('Render error:', renderError);
                  // Fallback rendering
                  const rootElement = document.getElementById('root');
                  if (rootElement) {
                    rootElement.innerHTML = '<div style="padding: 20px; color: red;">Render Error: ' + renderError.message + '</div>';
                  }
                }
                
                // Send render complete message
                window.parent.postMessage({ type: 'RENDER_COMPLETE' }, '*');
                
              } catch (error) {
                console.error('Error executing code:', error);
                document.getElementById('root').innerHTML = 
                  '<div style="padding: 20px; color: red; font-family: monospace;">' +
                  '<h2>Runtime Error:</h2>' +
                  '<pre>' + error.message + '</pre>' +
                  '<h3>Available Dependencies:</h3>' +
                  '<ul>' +
                  '<li>React (useState, useEffect, etc.)</li>' +
                  '<li>ReactDOM</li>' +
                  '<li>Lucide Icons</li>' +
                  '<li>Axios</li>' +
                  '<li>Lodash</li>' +
                  '<li>Tailwind CSS</li>' +
                  '</ul>' +
                  '</div>';
              }
            }

            // Start checking libraries after a short delay
            setTimeout(() => {
              checkLibraries();
              // Keep checking until all are loaded
              const checkInterval = setInterval(() => {
                if (Object.values(librariesLoaded).every(status => status)) {
                  clearInterval(checkInterval);
                } else {
                  checkLibraries();
                }
              }, 100);
            }, 100);
          </script>
        </body>
        </html>
      `;

      // Write HTML to iframe
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

    } catch (error) {
      console.error('Error rendering preview:', error);
    }
  };

  // Convert props array to object for component usage
  const convertPropsToObject = (propsArray) => {
    const propsObj = {};
    propsArray.forEach(prop => {
      try {
        if (prop.type === 'object' || prop.type === 'array') {
          propsObj[prop.key] = JSON.parse(prop.value);
        } else if (prop.type === 'boolean') {
          propsObj[prop.key] = prop.value === 'true';
        } else if (prop.type === 'number') {
          propsObj[prop.key] = parseFloat(prop.value);
        } else {
          propsObj[prop.key] = prop.value;
        }
      } catch (e) {
        propsObj[prop.key] = prop.value;
      }
    });
    return propsObj;
  };

  // Handle iframe messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'RENDER_COMPLETE') {
        setRenderComplete(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...component,
        code,
        defaultProps: props
      });
    }
  };

  const handlePropsChange = (newProps) => {
    setProps(newProps);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-7xl flex flex-col ${component?.height ? `min-h-[${component.height}]` : 'min-h-[100px]'} max-h-[80vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {component?.name || 'Component Editor'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Live Preview - Left Side */}
          <div className="flex-1 bg-whit">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Component Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          {/* Props Panel - Right Side */}
          {/* <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Properties</h3>
              <button
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md"
                title="Close Editor"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <DynamicFormBuilder
                props={props}
                onChange={handlePropsChange}
              />
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ComponentEditor;