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
  const [selectedColor, setSelectedColor] = useState('black');

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
        <p>(bawal bastos)</p>
        {/* <p style={{ fontSize: '12px', color: '#666' }}>{dbStatus}</p> */}
      </header>

      <div className="main-workspace">
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
            <button
              title="Undo"
              onClick={() => canvasRef.current?.undo && canvasRef.current.undo()}
              style={{ marginLeft: 8 }}
            >
              Undo
            </button>
            <button
              title="Redo"
              onClick={() => canvasRef.current?.redo && canvasRef.current.redo()}
              style={{ marginLeft: 4 }}
            >
              Redo
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: 8 }}>
            {['black','#FF5252','#FFB300','#4CAF50','#2196F3','#9C27B0'].map((c) => (
              <button
                key={c}
                onClick={() => { setSelectedColor(c); setIsEraser(false); }}
                title={`Color ${c}`}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  border: selectedColor === c ? '3px solid #000' : '1px solid #999',
                  background: c,
                  padding: 0,
                  cursor: 'pointer'
                }}
              />
            ))}
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
          selectedColor={selectedColor} 
          brushSize={brushSize} 
          isEraser={isEraser} 
        />
      </div>

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