import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = forwardRef(({ selectedColor, brushSize, isEraser }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const maxHistory = 20;

  useImperativeHandle(ref, () => ({
    getDrawingData: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext('2d');
      tCtx.fillStyle = '#ffffff';
      tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      tCtx.drawImage(canvas, 0, 0);
      return tempCanvas.toDataURL('image/png');
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // push current state before clearing so it can be undone
      pushState();
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ensure white background for consistent exports
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    undo: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (undoStack.current.length === 0) return;
      const ctx = canvas.getContext('2d');
      const current = canvas.toDataURL('image/png');
      const last = undoStack.current.pop();
      // push current to redo stack
      redoStack.current.push(current);
      drawDataUrlToCanvas(last, ctx, canvas.width, canvas.height);
    },
    redo: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (redoStack.current.length === 0) return;
      const ctx = canvas.getContext('2d');
      const current = canvas.toDataURL('image/png');
      const next = redoStack.current.pop();
      // push current to undo stack
      undoStack.current.push(current);
      drawDataUrlToCanvas(next, ctx, canvas.width, canvas.height);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : selectedColor; 
    ctx.lineWidth = brushSize; 
  }, [selectedColor, brushSize, isEraser]);

  // Push the current canvas state to the undo stack
  const pushState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const snapshot = canvas.toDataURL('image/png');
      undoStack.current.push(snapshot);
      // cap history
      if (undoStack.current.length > maxHistory) undoStack.current.shift();
      // clear redo when new action occurs
      redoStack.current = [];
    } catch {
      // ignore
    }
  };

  const drawDataUrlToCanvas = (dataUrl, ctx, width, height) => {
    const img = new Image();
    img.onload = () => {
      // clear then draw
      ctx.clearRect(0, 0, width, height);
      // fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.onerror = () => {
      // no-op
    };
    img.src = dataUrl;
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    // push the current state for undo
    pushState();
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    
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
        width={160}
        height={160} 
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ cursor: 'crosshair', touchAction: 'none' }}
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;