import * as Babel from '@babel/standalone';

class WebsiteExporter {
  constructor(components, websiteTitle = 'My Website') {
    this.components = components;
    this.websiteTitle = websiteTitle;
  }

  // Extract component name from code
  extractComponentName(code) {
    const functionMatch = code.match(/function\s+([A-Za-z][A-Za-z0-9_]*)\s*\(/);
    if (functionMatch) return functionMatch[1];
    
    const constMatch = code.match(/const\s+([A-Za-z][A-Za-z0-9_]*)\s*=/);
    if (constMatch) return constMatch[1];
    
    return null;
  }

  // Generate clean component code without render calls
  cleanComponentCode(code) {
    let cleanCode = code;
    
    // Remove any existing render calls
    cleanCode = cleanCode.replace(/ReactDOM\.render\([^)]+\);?/g, '');
    cleanCode = cleanCode.replace(/root\.render\([^)]+\);?/g, '');
    cleanCode = cleanCode.replace(/if\s*\(\s*window\.root.*?\}/gs, '');
    
    return cleanCode.trim();
  }

  // Generate props object for a component
  generatePropsObject(component) {
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
    return props;
  }

  // Generate HTML file
  generateHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.websiteTitle}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root"></div>
  <script src="script.js"></script>
</body>
</html>`;
  }

  // Generate CSS file
  generateCSS() {
    return `/* Website Styles */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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

/* Responsive Design */
@media (max-width: 768px) {
  .website-container {
    padding: 0;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}`;
  }

  // Generate JavaScript file
  generateJS() {
    let combinedComponents = '';
    let componentElements = [];

    this.components.forEach((component, index) => {
      const cleanCode = this.cleanComponentCode(component.code);
      const props = this.generatePropsObject(component);
      const componentName = this.extractComponentName(cleanCode) || `Component${index}`;
      
      // Transpile JSX code using Babel
      let transpiledCode;
      try {
        if (cleanCode.includes('<') && cleanCode.includes('>')) {
          transpiledCode = Babel.transform(cleanCode, {
            presets: ['react']
          }).code;
        } else {
          transpiledCode = cleanCode;
        }
      } catch (error) {
        console.warn(`Error transpiling component ${componentName}:`, error);
        transpiledCode = cleanCode; // Fallback to original code
      }
      
      // Add transpiled component code
      combinedComponents += `\n${transpiledCode}\n`;
      
      // Create component element call
      const propsString = JSON.stringify(props);
      componentElements.push(`React.createElement(${componentName}, ${propsString})`);
    });

    const jsCode = `
// Website Components
${combinedComponents}

// Website Container Component
const WebsiteContainer = () => {
  const websiteElements = [
    ${componentElements.join(',\n    ')}
  ];
  
  return React.createElement('div', { className: 'website-container' }, ...websiteElements);
};

// Initialize and render the website
(function() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }
  
  try {
    if (ReactDOM.createRoot) {
      // React 18+
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(WebsiteContainer));
    } else {
      // React 17 and below
      ReactDOM.render(React.createElement(WebsiteContainer), rootElement);
    }
  } catch (error) {
    console.error('Error rendering website:', error);
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center; color: red;"><h2>Rendering Error</h2><p>' + error.message + '</p></div>';
  }
})();
`;

    return jsCode;
  }

  // Download a file
  downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Export all files
  exportWebsite() {
    if (this.components.length === 0) {
      alert('No components to export. Please add some components first.');
      return;
    }

    try {
      // Generate files
      const htmlContent = this.generateHTML();
      const cssContent = this.generateCSS();
      const jsContent = this.generateJS();

      // Download files
      this.downloadFile(htmlContent, 'index.html', 'text/html');
      
      // Small delay between downloads to avoid browser blocking
      setTimeout(() => {
        this.downloadFile(cssContent, 'styles.css', 'text/css');
      }, 100);
      
      setTimeout(() => {
        this.downloadFile(jsContent, 'script.js', 'application/javascript');
      }, 200);

      return {
        success: true,
        message: 'Website exported successfully! Check your downloads folder for index.html, styles.css, and script.js'
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        message: 'Error exporting website: ' + error.message
      };
    }
  }

  // Export as ZIP file (requires JSZip library)
  async exportAsZip() {
    try {
      // Check if JSZip is available
      if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library not loaded. Please include JSZip to use ZIP export.');
      }

      const zip = new JSZip();
      
      // Add files to ZIP
      zip.file('index.html', this.generateHTML());
      zip.file('styles.css', this.generateCSS());
      zip.file('script.js', this.generateJS());
      
      // Generate ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download ZIP file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.websiteTitle.replace(/\s+/g, '-').toLowerCase()}-website.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: 'Website exported as ZIP successfully!'
      };
    } catch (error) {
      console.error('ZIP export error:', error);
      return {
        success: false,
        message: 'Error exporting as ZIP: ' + error.message
      };
    }
  }
}

export default WebsiteExporter;