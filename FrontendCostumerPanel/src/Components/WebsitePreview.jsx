import React, { useRef, useEffect } from 'react';
import * as Babel from '@babel/standalone';

const WebsitePreview = ({ components }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current && components.length > 0) {
      renderWebsite();
    }
  }, [components]);

  const renderWebsite = () => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    try {
      // Combine all component codes and props
      let combinedComponents = '';
      let componentElements = [];

      components.forEach((component, index) => {
        // Prepare props object for each component
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

        // Extract component function from code
        let componentCode = component.code;
        
        // Remove any existing render calls
        componentCode = componentCode.replace(/ReactDOM\.render\([^)]+\);?/g, '');
        componentCode = componentCode.replace(/root\.render\([^)]+\);?/g, '');
        componentCode = componentCode.replace(/if\s*\(\s*window\.root.*?\}/gs, '');
        
        // Add component code to combined components
        combinedComponents += `\n${componentCode}\n`;
        
        // Create component element call
        const componentName = extractComponentName(componentCode) || `Component${index}`;
        const propsString = JSON.stringify(props);
        componentElements.push(`React.createElement(${componentName}, ${propsString})`);
      });

      // Create the final render code
      const renderCode = `
        // Ensure React hooks are available
        const { useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue } = React;
        
        ${combinedComponents}
        
        // Render all components in sequence
        const websiteElements = [
          ${componentElements.join(',\n          ')}
        ];
        
        const WebsiteContainer = () => {
          return React.createElement('div', { className: 'website-container' }, ...websiteElements);
        };
        
        // Render the complete website
        if (window.root && window.root.render) {
          window.root.render(React.createElement(WebsiteContainer));
        } else {
          const rootElement = document.getElementById('root');
          if (rootElement && ReactDOM && ReactDOM.render) {
            ReactDOM.render(React.createElement(WebsiteContainer), rootElement);
          }
        }
      `;

      // Transform the code using Babel
      let compiledCode;
      if (renderCode.includes('<') && renderCode.includes('>')) {
        compiledCode = Babel.transform(renderCode, {
          presets: ['react']
        }).code;
      } else {
        compiledCode = renderCode;
      }

      // Create HTML content for the complete website
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Website Preview</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: white;
              overflow-x: hidden;
            }
            .website-container {
              width: 100%;
              min-height: 100vh;
            }
            .website-container > * {
              width: 100%;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            // Wait for React to be fully loaded
            window.addEventListener('load', function() {
              // Ensure React and ReactDOM are available globally
              window.React = React;
              window.ReactDOM = ReactDOM;
              
              // Create React root
              const rootElement = document.getElementById('root');
              if (ReactDOM.createRoot) {
                window.root = ReactDOM.createRoot(rootElement);
              }
              
              // Execute compiled component code
              try {
                ${compiledCode}
              } catch (error) {
                console.error('Error rendering website:', error);
                const errorElement = React.createElement('div', {
                  style: {
                    padding: '20px',
                    textAlign: 'center',
                    color: 'red',
                    fontFamily: 'monospace'
                  }
                }, 
                  React.createElement('h2', null, 'Rendering Error'),
                  React.createElement('p', null, error.message)
                );
                
                if (window.root && window.root.render) {
                  window.root.render(errorElement);
                } else if (ReactDOM && ReactDOM.render) {
                  ReactDOM.render(errorElement, rootElement);
                }
              }
            });
          </script>
        </body>
        </html>
      `;

      // Write HTML content to iframe
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

    } catch (error) {
      console.error('Error rendering website preview:', error);
    }
  };

  // Helper function to extract component name from code
  const extractComponentName = (code) => {
    const functionMatch = code.match(/function\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/);;
    if (functionMatch) return functionMatch[1];
    
    const constMatch = code.match(/const\s+([A-Za-z][A-Za-z0-9_]*)\s*=/);
    if (constMatch) return constMatch[1];
    
    return null;
  };

  return (
    <div className="w-full h-full bg-white">
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              No Components Added
            </h3>
            <p className="text-gray-600">
              Add components to see your website preview
            </p>
          </div>
        </div>
      ) : (
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Website Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
};

export default WebsitePreview;