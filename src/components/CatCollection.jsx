import React from 'react';
import './CatCollection.css';

const CatCollection = ({ cats, onBack }) => {
  return (
    <div className="app-container">
      <header className="drawing-header">
        <h1>Bahay Pusa</h1>
        <button onClick={onBack} style={{ marginBottom: '10px' }}>← Back to Drawing</button>
      </header>

      <div className="litter-container">
        {cats && cats.length > 0 ? (
          <div className="litter-grid">
            {cats.map((cat) => (
              <div key={cat.id} className="cat-frame" style={{ '--cat-color': cat.color || '#111' }}>
                <div className="tail"></div>
                <div className="cat-scene">
                  <div className="cat-head">
                    <div className="ear-left"></div>
                    <div className="ear-right"></div>
                    <div className="ear-inner-left"></div>
                    <div className="ear-inner-right"></div>
                    <img src={cat.image_url || cat.image_data} alt={cat.name} className="cat-face-overlay" />
                  </div>
                  <div className="cat-body">
                    <div className="paw-left"></div>
                    <div className="paw-right"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>The collection is empty! Go draw some cats.</p>
        )}
      </div>
    </div>
  );
};

export default CatCollection;