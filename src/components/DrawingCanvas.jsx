import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './DrawingCanvas.css';

// Added isEraser to the accepted props
const DrawingCanvas = forwardRef(({ selectedColor, brushSize, isEraser }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useImperativeHandle(ref, () => ({
    getDrawingData: () => {
      // Create a temporary canvas to ensure the background is perfectly white
      // This guarantees transparency isn't saved as black in some image viewers
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tCtx.drawImage(canvasRef.current, 0, 0);
      return tempCanvas.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // ✨ If eraser is active, use white. Otherwise, use the selected color.
    ctx.strokeStyle = isEraser ? '#ffffff' : selectedColor; 
    ctx.lineWidth = brushSize; 
  }, [selectedColor, brushSize, isEraser]);

  // Helper to get coordinates for both Mouse and Touch
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Check if it's a touch event or mouse event
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <div className="canvas-container">
      <canvas 
        ref={canvasRef}
        width={160} /* Increased resolution for better mobile clarity */
        height={160} 
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        /* Mobile Touch Events */
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});

export default DrawingCanvas;