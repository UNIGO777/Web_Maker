import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, FileText, Check, X } from 'lucide-react';

const DynamicFormBuilder = ({ value, onChange, type = 'object', depth = 0 }) => {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const maxDepth = 10; // Prevent infinite nesting

  if (depth > maxDepth) {
    return (
      <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
        Maximum nesting depth reached
      </div>
    );
  }

  const handleJsonImport = () => {
    try {
      let parsed;
      
      // First try standard JSON.parse
      try {
        parsed = JSON.parse(jsonInput);
      } catch (jsonError) {
        // If JSON.parse fails, try to fix common JavaScript object notation issues
        let fixedInput = jsonInput
          // Add quotes around unquoted property names
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
          // Handle single quotes
          .replace(/'/g, '"');
        
        try {
          parsed = JSON.parse(fixedInput);
        } catch (fixError) {
          // If still fails, try using Function constructor as last resort (for simple cases)
          try {
            parsed = new Function('return ' + jsonInput)();
          } catch (evalError) {
            throw new Error('Invalid format');
          }
        }
      }
      
      // Validate type matches
      if (type === 'array' && !Array.isArray(parsed)) {
        setJsonError('Input must be a valid array');
        return;
      }
      if (type === 'object' && (Array.isArray(parsed) || typeof parsed !== 'object' || parsed === null)) {
        setJsonError('Input must be a valid object');
        return;
      }
      
      onChange(parsed);
      setJsonInput('');
      setJsonError('');
      setShowJsonImport(false);
    } catch (error) {
      setJsonError('Invalid format. Please use valid JSON or JavaScript object notation.');
    }
  };

  const handleCancelJsonImport = () => {
    setJsonInput('');
    setJsonError('');
    setShowJsonImport(false);
  };

  const getTypeColor = (itemType) => {
    const colors = {
      string: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      boolean: 'bg-purple-100 text-purple-800',
      object: 'bg-orange-100 text-orange-800',
      array: 'bg-pink-100 text-pink-800'
    };
    return colors[itemType] || 'bg-gray-100 text-gray-800';
  };

  const renderPrimitiveInput = (val, onUpdate, inputType) => {
    if (inputType === 'boolean') {
      return (
        <select
          value={val?.toString() || 'false'}
          onChange={(e) => onUpdate(e.target.value === 'true')}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (inputType === 'number') {
      return (
        <input
          type="number"
          value={val || 0}
          onChange={(e) => onUpdate(Number(e.target.value) || 0)}
          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        />
      );
    }

    return (
      <input
        type="text"
        value={val || ''}
        onChange={(e) => onUpdate(e.target.value)}
        className="w-full text-sm border border-gray-300 rounded px-2 py-1"
        placeholder="Enter value"
      />
    );
  };

  const renderArrayForm = () => {
    const arrayValue = Array.isArray(value) ? value : [];

    const addItem = () => {
      const newItem = '';
      onChange([...arrayValue, newItem]);
    };

    const removeItem = (index) => {
      const newArray = arrayValue.filter((_, i) => i !== index);
      onChange(newArray);
    };

    const updateItem = (index, newValue, itemType) => {
      const newArray = [...arrayValue];
      if (itemType === 'object') {
        newArray[index] = typeof newValue === 'object' ? newValue : {};
      } else if (itemType === 'array') {
        newArray[index] = Array.isArray(newValue) ? newValue : [];
      } else {
        newArray[index] = newValue;
      }
      onChange(newArray);
    };

    const getItemType = (item) => {
      if (Array.isArray(item)) return 'array';
      if (typeof item === 'object' && item !== null) return 'object';
      if (typeof item === 'number') return 'number';
      if (typeof item === 'boolean') return 'boolean';
      return 'string';
    };

    const changeItemType = (index, newType) => {
      const defaultValues = {
        string: '',
        number: 0,
        boolean: false,
        object: {},
        array: []
      };
      updateItem(index, defaultValues[newType], newType);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor('array')}`}>
              Array ({arrayValue.length} items)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowJsonImport(!showJsonImport)}
              className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
              title="Import JSON data"
            >
              <FileText size={14} />
            </button>
            <button
              onClick={addItem}
              className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
              title="Add item"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
            {/* JSON Import Section */}
             {showJsonImport && (
               <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                 <div className="flex items-center justify-between mb-2">
                   <h4 className="text-sm font-medium text-blue-800">Import JSON Array</h4>
                   <button
                     onClick={handleCancelJsonImport}
                     className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                   >
                     <X size={12} />
                   </button>
                 </div>
                 <textarea
                   value={jsonInput}
                   onChange={(e) => {
                     setJsonInput(e.target.value);
                     setJsonError('');
                   }}
                   className="w-full text-sm border border-blue-300 rounded px-2 py-1 font-mono mb-2"
                   placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
                   rows={4}
                 />
                 {jsonError && (
                   <div className="text-red-600 text-xs mb-2">{jsonError}</div>
                 )}
                 <div className="flex gap-2">
                   <button
                     onClick={handleJsonImport}
                     disabled={!jsonInput.trim()}
                     className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                   >
                     <Check size={12} />
                     Import
                   </button>
                   <button
                     onClick={handleCancelJsonImport}
                     className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                   >
                     Cancel
                   </button>
                 </div>
               </div>
             )}
            {arrayValue.map((item, index) => {
              const itemType = getItemType(item);
              return (
                <div key={index} className="bg-gray-50 p-2 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">#{index}</span>
                      <select
                        value={itemType}
                        onChange={(e) => changeItemType(index, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {itemType === 'object' || itemType === 'array' ? (
                    <DynamicFormBuilder
                      value={item}
                      onChange={(newValue) => updateItem(index, newValue, itemType)}
                      type={itemType}
                      depth={depth + 1}
                    />
                  ) : (
                    renderPrimitiveInput(
                      item,
                      (newValue) => updateItem(index, newValue, itemType),
                      itemType
                    )
                  )}
                </div>
              );
            })}

            {arrayValue.length === 0 && (
              <div className="text-gray-500 text-sm italic p-2">
                Empty array - click + to add items
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderObjectForm = () => {
    const objectValue = typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
    const entries = Object.entries(objectValue);

    const addProperty = () => {
      const newKey = `property${Object.keys(objectValue).length + 1}`;
      onChange({ ...objectValue, [newKey]: '' });
    };

    const removeProperty = (key) => {
      const newObject = { ...objectValue };
      delete newObject[key];
      onChange(newObject);
    };

    const updatePropertyKey = (oldKey, newKey) => {
      if (oldKey === newKey) return;
      const newObject = { ...objectValue };
      newObject[newKey] = newObject[oldKey];
      delete newObject[oldKey];
      onChange(newObject);
    };

    const updatePropertyValue = (key, newValue, valueType) => {
      const newObject = { ...objectValue };
      if (valueType === 'object') {
        newObject[key] = typeof newValue === 'object' ? newValue : {};
      } else if (valueType === 'array') {
        newObject[key] = Array.isArray(newValue) ? newValue : [];
      } else {
        newObject[key] = newValue;
      }
      onChange(newObject);
    };

    const getValueType = (val) => {
      if (Array.isArray(val)) return 'array';
      if (typeof val === 'object' && val !== null) return 'object';
      if (typeof val === 'number') return 'number';
      if (typeof val === 'boolean') return 'boolean';
      return 'string';
    };

    const changeValueType = (key, newType) => {
      const defaultValues = {
        string: '',
        number: 0,
        boolean: false,
        object: {},
        array: []
      };
      updatePropertyValue(key, defaultValues[newType], newType);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor('object')}`}>
              Object ({entries.length} properties)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowJsonImport(!showJsonImport)}
              className="p-1 hover:bg-blue-100 text-blue-600 rounded transition-colors"
              title="Import JSON data"
            >
              <FileText size={14} />
            </button>
            <button
              onClick={addProperty}
              className="p-1 hover:bg-green-100 text-green-600 rounded transition-colors"
              title="Add property"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
            {/* JSON Import Section */}
            {showJsonImport && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-800">Import JSON Object</h4>
                  <button
                    onClick={handleCancelJsonImport}
                    className="p-1 hover:bg-blue-100 text-blue-600 rounded"
                  >
                    <X size={12} />
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setJsonError('');
                  }}
                  className="w-full text-sm border border-blue-300 rounded px-2 py-1 font-mono mb-2"
                  placeholder='{name: "John", age: 30, skills: ["React", "Node.js"]}'
                  rows={4}
                />
                {jsonError && (
                  <div className="text-red-600 text-xs mb-2">{jsonError}</div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleJsonImport}
                    disabled={!jsonInput.trim()}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Check size={12} />
                    Import
                  </button>
                  <button
                    onClick={handleCancelJsonImport}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {entries.map(([key, val]) => {
              const valueType = getValueType(val);
              return (
                <div key={key} className="bg-gray-50 p-2 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updatePropertyKey(key, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5 font-mono bg-white"
                        placeholder="Property name"
                      />
                      <select
                        value={valueType}
                        onChange={(e) => changeValueType(key, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-1 py-0.5"
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeProperty(key)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Remove property"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {valueType === 'object' || valueType === 'array' ? (
                    <DynamicFormBuilder
                      value={val}
                      onChange={(newValue) => updatePropertyValue(key, newValue, valueType)}
                      type={valueType}
                      depth={depth + 1}
                    />
                  ) : (
                    renderPrimitiveInput(
                      val,
                      (newValue) => updatePropertyValue(key, newValue, valueType),
                      valueType
                    )
                  )}
                </div>
              );
            })}

            {entries.length === 0 && (
              <div className="text-gray-500 text-sm italic p-2">
                Empty object - click + to add properties
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (type === 'array') {
    return renderArrayForm();
  }

  if (type === 'object') {
    return renderObjectForm();
  }

  // Fallback for primitive types
  return renderPrimitiveInput(value, onChange, type);
};

export default DynamicFormBuilder;