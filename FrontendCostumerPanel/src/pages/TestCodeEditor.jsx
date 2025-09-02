import React from 'react';
import AdminEditor from './admin/CodeEditor';

export default function TestCodeEditor() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Code Editor Test Page</h1>
          <p className="text-gray-600">Testing the CodeEditor and LivePreview components</p>
        </div>
        <AdminEditor />
      </div>
    </div>
  );
}