import React, { useState } from 'react';
import LivePreview from './admin/LivePreview';

export default function LivePreviewTest() {
  const [code, setCode] = useState(`function MyComponent() {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Hello World!</h1>
      <p className="text-gray-700">This is a test React component with Tailwind CSS!</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Click me!
      </button>
    </div>
  );
}

if (window.root && window.root.render) {
  window.root.render(React.createElement(MyComponent, props));
} else if (window.ReactDOM && window.ReactDOM.render) {
  ReactDOM.render(React.createElement(MyComponent, props), document.getElementById('root'));
} else {
  console.error('Neither root nor ReactDOM.render is available');
}`);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">LivePreview Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Input */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Code Input</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder="Enter React code here..."
            />
          </div>
          
          {/* Live Preview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
            <div className="border border-gray-300 rounded-lg h-64">
              <LivePreview 
                code={code} 
                props={{}} 
                onRenderComplete={() => console.log('Render complete!')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}