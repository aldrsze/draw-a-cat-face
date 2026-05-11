import React, { useState, useRef, useEffect } from 'react';
import CatCollection from './components/CatCollection';
import CatShow from './components/CatShow';
import DrawingCanvas from './components/DrawingCanvas';
import './App.css';

function App() {
  const [view, setView] = useState('draw'); 
  const [catName, setCatName] = useState('');
  const [brushSize, setBrushSize] = useState(5); 
  const [isEraser, setIsEraser] = useState(false); 
  const canvasRef = useRef(); 

  // ✨ STATIC DB: Load saved cats from local storage (or start empty)
  const [galleryCats, setGalleryCats] = useState(() => {
    const savedCats = localStorage.getItem('catGallery');
    return savedCats ? JSON.parse(savedCats) : [];
  });

  // ✨ STATIC DB: Save to local storage automatically whenever the gallery updates
  useEffect(() => {
    localStorage.setItem('catGallery', JSON.stringify(galleryCats));
  }, [galleryCats]);

  const handleMakeItMeow = () => {
    if (!catName) return alert("Please name your cat!");
    
    const imageData = canvasRef.current.getDrawingData();
    
    // Create a new "database row" locally
    const newCat = {
      id: Date.now(), // Generate a unique ID using the current time
      name: catName,
      image_data: imageData,
      stars: 0
    };

    // Add the new cat to the top of our gallery list
    setGalleryCats([newCat, ...galleryCats]);
    
    // Reset and switch view
    setCatName('');
    setView('show');
  };

  // Handle starring a cat locally
  const handleStar = (id) => {
    setGalleryCats(galleryCats.map(cat => 
      cat.id === id ? { ...cat, stars: cat.stars + 1 } : cat
    ));
  };

  if (view === 'litter') return <CatCollection cats={galleryCats} onBack={() => setView('draw')} />; 

  // ✨ Pass our local database down to the CatShow component
  if (view === 'show') {
    return <CatShow cats={galleryCats} onStar={handleStar} onBack={() => setView('draw')} />;
  }

  return (
    <div className="app-container">
      <header className="drawing-header">
        <h1>Draw a Cat Face!</h1>
        <p>(whiskers included please)</p>
      </header>

      <div className="toolbar">
        <div className="controls">
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              style={{ fontWeight: !isEraser ? 'bold' : 'normal', border: !isEraser ? '2px solid black' : '1px solid black' }}
              onClick={() => setIsEraser(false)}
            >
              Pen
            </button>
            <button 
              style={{ fontWeight: isEraser ? 'bold' : 'normal', border: isEraser ? '2px solid black' : '1px solid black' }}
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
          />
          <button className="btn-main" onClick={handleMakeItMeow}>make it meow!</button>
        </div>
        <a className="footer-link" onClick={() => setView('show')}>cat show</a>
      </footer>
    </div>
  );
}

export default App;