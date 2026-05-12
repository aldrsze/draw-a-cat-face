import React, { useState, useRef } from 'react';
import { useCatGallery } from './hooks/useCatGallery';
import CatCollection from './components/CatCollection';
import CatShow from './components/CatShow';
import DrawingCanvas from './components/DrawingCanvas';
import './App.css';

function App() {
  const { galleryCats, dbStatus, saveCat, starCat } = useCatGallery();
  const [view, setView] = useState('draw'); 
  const [catName, setCatName] = useState('');
  const [brushSize, setBrushSize] = useState(5); 
  const [isEraser, setIsEraser] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef();

  const handleMakeItMeow = async () => {
    if (isSaving) return; // Prevent double-submit
    
    setIsSaving(true);
    const imageData = canvasRef.current?.getDrawingData();
    
    const result = await saveCat(catName, imageData);
    
    if (result.success) {
      setCatName('');
      // Clear canvas
      if (canvasRef.current?.clearCanvas) {
        canvasRef.current.clearCanvas();
      }
      setView('show');
    } else {
      alert(result.error);
    }
    
    setIsSaving(false);
  };

  const handleStar = async (id) => {
    const result = await starCat(id);
    if (!result.success) {
      alert(result.error);
    }
  };

  // View: Collection
  if (view === 'litter') {
    return (
      <CatCollection 
        cats={galleryCats} 
        onBack={() => setView('draw')} 
      />
    );
  }

  // View: Gallery
  if (view === 'show') {
    return (
      <CatShow 
        cats={galleryCats} 
        onStar={handleStar} 
        onBack={() => setView('draw')} 
      />
    );
  }

  // View: Drawing (Default)
  return (
    <div className="app-container">
      <header className="drawing-header">
        <h1>Draw a Cat Face!</h1>
        <p>(whiskers included please)</p>
        <p style={{ fontSize: '12px', color: '#666' }}>{dbStatus}</p>
      </header>

      <div className="toolbar">
        <div className="controls">
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              style={{ 
                fontWeight: !isEraser ? 'bold' : 'normal', 
                border: !isEraser ? '2px solid black' : '1px solid black' 
              }}
              onClick={() => setIsEraser(false)}
            >
              Pen
            </button>
            <button 
              style={{ 
                fontWeight: isEraser ? 'bold' : 'normal', 
                border: isEraser ? '2px solid black' : '1px solid black' 
              }}
              onClick={() => setIsEraser(true)}
            >
              Eraser
            </button>
          </div>

          <div className="size-slider-container">
            <label style={{ fontSize: '14px' }}>Size: </label>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={brushSize} 
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <DrawingCanvas 
        ref={canvasRef} 
        selectedColor="black" 
        brushSize={brushSize} 
        isEraser={isEraser} 
      />

      <footer className="footer-actions">
        <a className="footer-link" onClick={() => setView('litter')}>collection</a>
        <div className="action-stack">
          <input 
            type="text" 
            placeholder="Cat name..." 
            className="cat-name-input"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            disabled={isSaving}
          />
          <button 
            className="btn-main" 
            onClick={handleMakeItMeow}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'make it meow!'}
          </button>
        </div>
        <a className="footer-link" onClick={() => setView('show')}>cat show</a>
      </footer>
    </div>
  );
}

export default App;