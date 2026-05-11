import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient'; // New Import
import CatCollection from './components/CatCollection';
import CatShow from './components/CatShow';
import DrawingCanvas from './components/DrawingCanvas';
import './App.css';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');
  const [view, setView] = useState('draw'); 
  const [catName, setCatName] = useState('');
  const [brushSize, setBrushSize] = useState(5); 
  const [isEraser, setIsEraser] = useState(false); 
  const canvasRef = useRef(); 
  const [galleryCats, setGalleryCats] = useState([]);

  // ✨ Fetch all cats from Supabase on component mount
  useEffect(() => {
    fetchCats();
  }, []);

  async function fetchCats() {
  try {
    const { data, error } = await supabase
      .from('cats')
      .select('id') // Just grab IDs to check connection
      .limit(1);
    
    if (error) {
      setDbStatus(`Connection Error: ${error.message}`);
      console.error('Supabase error:', error);
    } else {
      setDbStatus('Connected to Supabase ✅');
      
      // Now fetch the actual data
      const { data: fullData } = await supabase
        .from('cats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fullData) setGalleryCats(fullData);
    }
  } catch (err) {
    setDbStatus('Failed to reach database server.');
    console.error('Network error:', err);
  }
}

  const handleMakeItMeow = async () => {
    if (!catName) return alert("Please name your cat!");
    
    const imageData = canvasRef.current.getDrawingData(); //
    
    // ✨ Insert into Supabase instead of local storage
    const { data, error } = await supabase
      .from('cats')
      .insert([{ 
        name: catName, 
        image_data: imageData, 
        stars: 0 
      }])
      .select();

    if (error) {
      alert("Error saving your cat to the cloud!");
      console.error(error);
    } else {
      setGalleryCats([data[0], ...galleryCats]);
      setCatName('');
      setView('show');
    }
  };

  const handleStar = async (id) => {
    const catToUpdate = galleryCats.find(c => c.id === id);
    if (!catToUpdate) return;

    const newStarCount = catToUpdate.stars + 1;

    // ✨ Update the star count in the database
    const { error } = await supabase
      .from('cats')
      .update({ stars: newStarCount })
      .eq('id', id);

    if (error) {
      console.error('Error starring cat:', error);
    } else {
      // Update local state to reflect change immediately
      setGalleryCats(galleryCats.map(cat => 
        cat.id === id ? { ...cat, stars: newStarCount } : cat
      ));
    }
  };

  if (view === 'litter') return <CatCollection cats={galleryCats} onBack={() => setView('draw')} />; 

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