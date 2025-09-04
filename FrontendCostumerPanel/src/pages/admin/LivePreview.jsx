import React, { useEffect, useRef, useState } from "react";
import * as Babel from "@babel/standalone";

export default function LivePreview({ code, props = {}, onRenderComplete }) {
  const iframeRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    // console.log('LivePreview useEffect triggered with:', { code: code?.length, props });
    
    if (!iframeRef.current) {
      // console.log('No iframe reference in useEffect');
      return;
    }

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    try {
      // Check if code is empty and provide a default
      let codeToCompile = code.trim() || `
        function DefaultComponent() {
          return React.createElement('div', { style: { padding: '20px', textAlign: 'center' } }, 
            React.createElement('h1', null, 'No code provided'),
            React.createElement('p', null, 'Please enter some React code in the editor.')
          );
        }
        root.render(React.createElement(DefaultComponent));
      `;
      
      // Inject useState hooks into the code if they exist in props
       if (props.useStateHooks && Object.keys(props.useStateHooks).length > 0) {
         let hookDeclarations = '';
         Object.entries(props.useStateHooks).forEach(([hookName, initialValue]) => {
           const valueStr = typeof initialValue === 'string' ? `'${initialValue}'` : JSON.stringify(initialValue);
           hookDeclarations += `  const [${hookName}, set${hookName.charAt(0).toUpperCase() + hookName.slice(1)}] = React.useState(${valueStr});\n`;
         });
         
         // Look for React function components (function declarations or arrow functions)
         const functionPatterns = [
           /(function\s+[A-Z]\w*\s*\([^)]*\)\s*{)/,  // function MyComponent() {
           /(const\s+[A-Z]\w*\s*=\s*\([^)]*\)\s*=>\s*{)/,  // const MyComponent = () => {
           /(const\s+[A-Z]\w*\s*=\s*function\s*\([^)]*\)\s*{)/  // const MyComponent = function() {
         ];
         
         let matched = false;
         for (const pattern of functionPatterns) {
           const functionMatch = codeToCompile.match(pattern);
           if (functionMatch) {
             const insertIndex = functionMatch.index + functionMatch[0].length;
             codeToCompile = codeToCompile.slice(0, insertIndex) + '\n' + hookDeclarations + codeToCompile.slice(insertIndex);
             matched = true;
             break;
           }
         }
         
         // If no function component found, wrap the entire code in a component
         if (!matched) {
           codeToCompile = `function MyComponent() {\n${hookDeclarations}  return (\n    ${codeToCompile}\n  );\n}\nroot.render(React.createElement(MyComponent));`;
         }
       }
      
      // console.log('LivePreview: Code to compile:', codeToCompile);
      // console.log('LivePreview: About to write HTML to iframe');
      
      // Transform the code using Babel only if it contains JSX
      let compiledCode;
      if (codeToCompile.includes('<') && codeToCompile.includes('>')) {
        // console.log('LivePreview: Compiling JSX code with Babel');
        compiledCode = Babel.transform(codeToCompile, {
          presets: ['react']
        }).code;
      } else {
        // console.log('LivePreview: Using plain JavaScript code');
        compiledCode = codeToCompile;
      }

      // Create HTML content with Tailwind CSS and React
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
            #root { width: 100%; height: 100vh; min-height: 100vh; background: #f9f9f9; }
            .fullscreen-btn {
              position: fixed;
              top: 10px;
              right: 10px;
              padding: 8px;
              background: rgba(0, 0, 0, 0.6);
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              z-index: 1000;
            }
            .fullscreen-btn:hover {
              background: rgba(0, 0, 0, 0.8);
            }
          </style>
        </head>
        <body>
          <button class="fullscreen-btn" onclick="toggleFullScreen()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
          </button>
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
              <p style="margin-top: 15px;">If libraries don't load, check console for errors.</p>
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
              // Test if JavaScript is executing at all
              // console.log('JavaScript is executing!');
              
              // Update loading status to show JS is running
              document.addEventListener('DOMContentLoaded', function() {
                const loadingStatus = document.getElementById('loading-status');
                if (loadingStatus) {
                  loadingStatus.innerHTML = '<h2>JavaScript is running! Checking libraries...</h2>' + loadingStatus.innerHTML.replace('<h2>Loading Libraries...</h2>', '');
                }
              });
              
              function toggleFullScreen() {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }
              
              // Make libraries globally available
              window.componentProps = ${JSON.stringify(props)};
              window.BACKEND_URL = '${backendUrl}';
              
              // Wait for all libraries to load
              function waitForLibraries() {
                return new Promise((resolve) => {
                  const checkLibraries = () => {
                    // Update visual indicators
                    const updateStatus = (id, loaded) => {
                      const element = document.getElementById(id);
                      if (element) element.textContent = loaded ? '✅' : '❌';
                    };
                    
                    updateStatus('react-status', !!window.React);
                    updateStatus('reactdom-status', !!window.ReactDOM);
                    updateStatus('lucide-status', !!window.lucide);
                    updateStatus('axios-status', !!window.axios);
                    updateStatus('lodash-status', !!window._);
                    
                    // console.log('Checking libraries:', {
                    //   React: !!window.React,
                    //   ReactDOM: !!window.ReactDOM,
                    //   lucide: !!window.lucide,
                    //   axios: !!window.axios,
                    //   lodash: !!window._
                    // });
                    
                    if (window.React && 
                        window.ReactDOM && 
                        window.lucide && 
                        window.axios && 
                        window._) {
                      // console.log('All libraries loaded successfully!');
                      resolve();
                    } else {
                      // console.log('Still waiting for libraries...');
                      setTimeout(checkLibraries, 100);
                    }
                  };
                  checkLibraries();
                });
              }
              
              // React hooks are accessed via React.useState, React.useEffect, etc.
              // This follows the Rules of Hooks and avoids global hook violations
              
              // Make Framer Motion available (avoid redeclaration)
               if (typeof window.motion === 'undefined') {
                 const { motion, AnimatePresence } = window.FramerMotion || { motion: {}, AnimatePresence: null };
                 window.motion = motion;
                 window.AnimatePresence = AnimatePresence;
               }
              
              // Make React utilities available (avoid redeclaration)
               if (typeof window.createElement === 'undefined') {
                 const { createElement } = React;
                 window.createElement = createElement;
               }
              
              // Lucide Icons - make available globally
              if (window.lucide) {
                const iconNames = [
                  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Plus', 'Minus', 'X', 'Check',
                  'Settings', 'User', 'Home', 'Search', 'Menu', 'Bell', 'Heart', 'Star', 'Eye', 'EyeOff',
                  'Edit', 'Delete', 'Save', 'Download', 'Upload', 'Share', 'Copy', 'Paste', 'Cut',
                  'Play', 'Pause', 'Stop', 'SkipForward', 'SkipBack', 'Volume2', 'VolumeX',
                  'Calendar', 'Clock', 'Mail', 'Phone', 'MapPin', 'Globe', 'Camera', 'Image',
                  'File', 'Folder', 'FolderOpen',
                  'ChevronLeft', 'ChevronRight', 'ChevronUp', 'ChevronDown',
                  'AlertCircle', 'CheckCircle', 'Info', 'XCircle', 'HelpCircle',
                  'Loader', 'Spinner', 'RefreshCw', 'RotateCcw', 'RotateCw',
                  'Trash2', 'Edit2', 'Edit3', 'PenTool', 'Type', 'Bold', 'Italic', 'Underline',
                  'AlignLeft', 'AlignCenter', 'AlignRight', 'AlignJustify',
                  'List', 'Grid', 'BarChart', 'PieChart', 'TrendingUp', 'TrendingDown',
                  'Wifi', 'WifiOff', 'Battery', 'BatteryLow', 'Signal', 'SignalZero',
                  'Sun', 'Moon', 'Cloud', 'CloudRain', 'Zap', 'Flame', 'Droplets',
                  'Car', 'Plane', 'Train', 'Bike', 'Walk',
                  'ShoppingCart', 'CreditCard', 'DollarSign', 'Percent', 'Tag',
                  'Lock', 'Unlock', 'Shield', 'ShieldCheck', 'Key', 'Fingerprint',
                  'Code', 'Terminal', 'Database', 'Server', 'Cpu', 'HardDrive',
                  'Smartphone', 'Tablet', 'Monitor', 'Laptop', 'Headphones', 'Speaker'
                ];
                
                // Create React components for each icon
                iconNames.forEach(iconName => {
                  if (window.lucide[iconName]) {
                    window[iconName] = (props) => {
                      const iconElement = window.lucide[iconName]();
                      return React.createElement('span', {
                        dangerouslySetInnerHTML: { __html: iconElement.outerHTML },
                        ...props
                      });
                    };
                  }
                });
              }
              
              // Axios and Lodash utilities (avoid redeclaration)
               if (window.axios && typeof window.get === 'undefined') {
                 const { get, post, put, delete: del, patch } = window.axios;
                 window.get = get;
                 window.post = post;
                 window.put = put;
                 window.del = del;
                 window.patch = patch;
               }
               
               if (window._ && typeof window.debounce === 'undefined') {
                 const { debounce, throttle, cloneDeep, merge, pick, omit, get: lodashGet, set, has, isEmpty, isEqual } = window._;
                 window.debounce = debounce;
                 window.throttle = throttle;
                 window.cloneDeep = cloneDeep;
                 window.merge = merge;
                 window.pick = pick;
                 window.omit = omit;
                 window.lodashGet = lodashGet;
                 window.set = set;
                 window.has = has;
                 window.isEmpty = isEmpty;
                 window.isEqual = isEqual;
               }
              
              // Execute code after libraries are loaded
              async function executeCode() {
                // console.log('Iframe executeCode: Starting execution...');
                
                // Add a visual indicator that executeCode was called
                const statusDiv = document.getElementById('loading-status');
                if (statusDiv) {
                  statusDiv.innerHTML = '<h2 style="color: green;">Iframe executeCode() was called! Setting up...</h2>' + statusDiv.innerHTML;
                }
                
                try {
                  // Check if code uses React (contains JSX or React calls)
                  const compiledCodeStr = \`${compiledCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                  const usesReact = compiledCodeStr.includes('React.') || compiledCodeStr.includes('root.render') || compiledCodeStr.includes('<');
                  
                  if (usesReact) {
                    // console.log('executeCode: Code uses React, waiting for libraries...');
                    await waitForLibraries();
                    // console.log('executeCode: Libraries loaded successfully');
                    
                    // Make root available globally for user code
                    const rootElement = document.getElementById('root');
                    // console.log('executeCode: Root element found:', rootElement);
                    window.root = ReactDOM.createRoot(rootElement);
                    window.props = window.componentProps;
                  } else {
                    // console.log('executeCode: Plain JavaScript code, executing immediately');
                    // Clear the loading status for plain JS
                    const loadingDiv = document.getElementById('loading-status');
                    if (loadingDiv) {
                      loadingDiv.innerHTML = '<h2 style="color: green;">Executing JavaScript...</h2>';
                    }
                  }
                  
                  // console.log('executeCode: About to execute user code...');
                  
                  // Execute the compiled code safely
                  const codeToExecute = \`${compiledCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
                  eval(codeToExecute);
                  
                  // console.log('executeCode: User code executed successfully');
                  
                  // Notify parent that rendering is complete
                  setTimeout(() => {
                    window.parent.postMessage({ type: 'RENDER_COMPLETE' }, '*');
                  }, 100);
                } catch (err) {
                  // console.error('Preview Error:', err);
                  document.getElementById('root').innerHTML = '<div style="padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px; font-family: monospace;"><h3 style="color: #c33; margin: 0 0 10px 0;">Runtime Error:</h3><pre style="color: #800; font-size: 14px; line-height: 1.4; white-space: pre-wrap; margin: 0;">' + err.message + '</pre><div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;"><strong>Available Dependencies:</strong><ul style="margin: 5px 0; padding-left: 20px;"><li><strong>React Hooks:</strong> useState, useEffect, useRef, useCallback, useMemo</li><li><strong>Icons:</strong> ArrowLeft, Plus, Settings, User, etc. (from Lucide React)</li><li><strong>Animations:</strong> motion.div, motion.button, AnimatePresence</li><li><strong>HTTP:</strong> axios for API calls</li><li><strong>Utils:</strong> lodash functions like debounce, throttle</li></ul></div></div>';
                  window.parent.postMessage({ type: 'RENDER_COMPLETE' }, '*');
                }
              }
              
              // Start execution
      
              executeCode();
              
              // Also try calling it after a delay in case of timing issues
              setTimeout(() => {
      
                executeCode();
              }, 1000);
            </script>
        </body>
        </html>
      `;

      // Clear and write the HTML content to the iframe
      iframeDoc.open();
      iframeDoc.write(''); // Clear any existing content
      iframeDoc.close();
      
      // Now write the new content
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    } catch (err) {
      // Display error in the iframe
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <body>
          <pre style="color:red; padding: 10px; background: #fee; border-radius: 4px; font-family: monospace; font-size: 12px; line-height: 1.4; white-space: pre-wrap;">${err.message}</pre>
        </body>
        </html>
      `;
      iframeDoc.open();
      iframeDoc.write(errorHtml);
      iframeDoc.close();
    }
  }, [code, props]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'RENDER_COMPLETE' && onRenderComplete) {
        onRenderComplete();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRenderComplete]);

  return (
    <div className="h-full relative">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Live Preview"
      />
    </div>
  );
}
