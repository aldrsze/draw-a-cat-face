import { useState, useRef } from 'react';
import { useCatGallery } from './hooks/useCatGallery';
import CatCollection from './components/CatCollection';
import CatShow from './components/CatShow';
import DrawingCanvas from './components/DrawingCanvas';
import './App.css';

// main component
function App() {
  // global state / hooks
  const { galleryCats, saveCat, starCat } = useCatGallery();

  // UI nav
  const [view, setView] = useState('draw'); 

  // Savings state
  const [catName, setCatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // canvas / drawing tools
  const canvasRef = useRef();
  const [brushSize, setBrushSize] = useState(1); 
  const [isEraser, setIsEraser] = useState(false); 
  const [selectedColor, setSelectedColor] = useState('black');

  // for Toasts
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  // handle save
  const handleMakeItMeow = async () => {
    // validation
    if (isSaving) return;
    setIsSaving(true);
    const imageData = canvasRef.current?.getDrawingData();
    
    // if theres no image data
    if (!imageData) {
      showErrorToast('Failed to capture drawing. Please try again.');
      setIsSaving(false);
      return;
    }
    
    // sends the data to database
    const result = await saveCat(catName, imageData);
    
    if (result.success) {
      setCatName('');
      if (canvasRef.current?.clearCanvas) {
        canvasRef.current.clearCanvas();
      }
      // goes to the 
      setView('show');
    } else {
      showErrorToast(result.error);
    }
    setIsSaving(false);
  };

  // updates the star count for a specific cat
  const handleStar = async (id) => {
    const result = await starCat(id);
    if (!result.success) {
      showErrorToast(result.error);
    }
  };

  // shows the error toast function
  const showErrorToast = (msg) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 3000); // Auto-dismiss in 3 sec
  };

  // View: Collection
  if (view === 'collection') {
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
      <section className="product-tile product-tile-light">
        <header className="drawing-header">
          <h1 className="hero-title">Draw a Cat Face!</h1>
          <p className="hero-tagline">Include the balbas, please.</p>
        </header>

        <div className="main-workspace">
          <div className="toolbar">
            <div className="controls">
              {/* Tool Selection */}
              <div className="tool-group">
                <button 
                  className={`btn-tool ${!isEraser ? 'active' : ''}`}
                  onClick={() => setIsEraser(false)}
                >
                  Pen
                </button>
                <button 
                  className={`btn-tool ${isEraser ? 'active' : ''}`}
                  onClick={() => setIsEraser(true)}
                >
                  Eraser
                </button>
              </div>

              <div className="history-controls">
                <button
                  className="btn-utility"
                  title="Undo"
                  onClick={() => canvasRef.current?.undo?.()}
                >
                  Undo
                </button>
                <button
                  className="btn-utility"
                  title="Redo"
                  onClick={() => canvasRef.current?.redo?.()}
                >
                  Redo
                </button>
              </div>

              {/* Color Palette */}
              <div className="color-palette">
                {[
                  '#1d1d1f', // Space Gray
                  '#f5f5f7', // Silver
                  '#ff3b30', // Apple Red
                  '#ff9500', // Apple Orange
                  '#34c759', // Apple Green
                  '#007aff', // Apple Blue
                  '#af52de', // Apple Purple
                  '#5856d6', // Apple Indigo
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSelectedColor(c); setIsEraser(false); }}
                    title={`Color ${c}`}
                    className={`color-swatch ${selectedColor === c ? 'selected' : ''}`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <div className="size-slider-container">
                <label className="size-label">Size</label>
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
              {isSaving ? 'Saving...' : 'Make it meow!'}
            </button>
          </div>
          
          <nav className="navigation-links">
            <a className="footer-link" onClick={() => setView('collection')}>Collection</a>
            <a className="footer-link" onClick={() => setView('show')}>Show all Cats</a>
          </nav>
        </footer>

        <p className="dev-credit">dev: aldrsze</p>
      </section>

      {/* Error Toast */}
      {showError && (
        <div className="error-toast">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default App;