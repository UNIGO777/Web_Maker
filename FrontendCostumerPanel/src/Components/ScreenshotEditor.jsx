import React, { useState, useRef, useEffect } from 'react';
import { X, Crop, RotateCcw, Download, Square } from 'lucide-react';

const ScreenshotEditor = ({ isOpen, onClose, imageData, onSave }) => {
  const canvasRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });
  const [aspectRatio, setAspectRatio] = useState('free');
  const [originalImage, setOriginalImage] = useState(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (imageData && isOpen) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to fit the container while maintaining aspect ratio
        const maxWidth = 600;
        const maxHeight = 400;
        const imgAspectRatio = img.width / img.height;
        
        let displayWidth, displayHeight;
        if (imgAspectRatio > maxWidth / maxHeight) {
          displayWidth = maxWidth;
          displayHeight = maxWidth / imgAspectRatio;
        } else {
          displayHeight = maxHeight;
          displayWidth = maxHeight * imgAspectRatio;
        }
        
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        setScale(displayWidth / img.width);
        
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // Initialize crop area to full image
        setCropArea({ x: 0, y: 0, width: displayWidth, height: displayHeight });
        setImageSize({ width: Math.round(img.width), height: Math.round(img.height) });
      };
      img.src = imageData;
    }
  }, [imageData, isOpen]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let width = x - dragStart.x;
    let height = y - dragStart.y;
    
    // Handle aspect ratio constraints
    if (aspectRatio !== 'free') {
      const ratio = parseFloat(aspectRatio);
      if (Math.abs(width) / Math.abs(height) > ratio) {
        width = height * ratio * Math.sign(width);
      } else {
        height = width / ratio * Math.sign(height);
      }
    }
    
    setCropArea({
      x: width < 0 ? dragStart.x + width : dragStart.x,
      y: height < 0 ? dragStart.y + height : dragStart.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const drawCropOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // Draw crop overlay
    if (cropArea.width > 0 && cropArea.height > 0) {
      // Darken the area outside the crop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear the crop area
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.drawImage(
        originalImage,
        cropArea.x / scale, cropArea.y / scale, cropArea.width / scale, cropArea.height / scale,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height
      );
      
      // Draw crop border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
      // Draw corner handles
      const handleSize = 8;
      ctx.fillStyle = '#3b82f6';
      const corners = [
        { x: cropArea.x - handleSize/2, y: cropArea.y - handleSize/2 },
        { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y - handleSize/2 },
        { x: cropArea.x - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 },
        { x: cropArea.x + cropArea.width - handleSize/2, y: cropArea.y + cropArea.height - handleSize/2 }
      ];
      corners.forEach(corner => {
        ctx.fillRect(corner.x, corner.y, handleSize, handleSize);
      });
    }
  };

  useEffect(() => {
    drawCropOverlay();
  }, [cropArea, originalImage]);

  const handleSizeChange = (dimension, value) => {
    const newSize = { ...imageSize, [dimension]: parseInt(value) || 0 };
    setImageSize(newSize);
  };

  const resetCrop = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCropArea({ x: 0, y: 0, width: canvas.width, height: canvas.height });
    }
  };

  const handleSave = () => {
    if (!originalImage || cropArea.width === 0 || cropArea.height === 0) return;
    
    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    // Set the output size
    cropCanvas.width = imageSize.width;
    cropCanvas.height = imageSize.height;
    
    // Calculate the crop area in original image coordinates
    const cropX = cropArea.x / scale;
    const cropY = cropArea.y / scale;
    const cropWidth = cropArea.width / scale;
    const cropHeight = cropArea.height / scale;
    
    // Draw the cropped and resized image
    cropCtx.drawImage(
      originalImage,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, imageSize.width, imageSize.height
    );
    
    // Convert to blob and call onSave
    cropCanvas.toBlob((blob) => {
      onSave(blob);
      onClose();
    }, 'image/png');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Screenshot</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 bg-gray-50">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 cursor-crosshair max-w-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          </div>
          
          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Aspect Ratio */}
            <div>
              <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="free">Free</option>
                <option value="1">1:1 (Square)</option>
                <option value="1.333">4:3</option>
                <option value="1.777">16:9</option>
                <option value="0.75">3:4 (Portrait)</option>
              </select>
            </div>
            
            {/* Output Size */}
            <div>
              <label className="block text-sm font-medium mb-2">Output Size (px)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Width</label>
                  <input
                    type="number"
                    value={imageSize.width}
                    onChange={(e) => handleSizeChange('width', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    max="4000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Height</label>
                  <input
                    type="number"
                    value={imageSize.height}
                    onChange={(e) => handleSizeChange('height', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    min="1"
                    max="4000"
                  />
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div>
              <label className="block text-sm font-medium mb-2">Quick Actions</label>
              <div className="space-y-2">
                <button
                  onClick={resetCrop}
                  className="w-full flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Square size={16} />
                  Reset Crop
                </button>
              </div>
            </div>
            
            {/* Crop Info */}
            {cropArea.width > 0 && (
              <div className="text-sm text-gray-600">
                <p>Crop Area: {Math.round(cropArea.width / scale)} × {Math.round(cropArea.height / scale)}px</p>
                <p>Output: {imageSize.width} × {imageSize.height}px</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={cropArea.width === 0 || cropArea.height === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download size={16} />
            Save Screenshot
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotEditor;