import React from 'react';
import './CatShow.css';

const CatShow = ({ cats, onStar, onBack }) => {

  return (
    <div className="app-container">
      <header className="drawing-header">
        <h1>Mga Posa</h1>
        <button onClick={onBack} style={{ marginBottom: '10px' }}>← Back to Drawing</button>
      </header>

      <div className="gallery-container">
        {cats.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>No cats yet! Go draw one.</p>
        ) : (
          <div className="gallery-grid">
            {cats.map((cat) => (
              <div key={cat.id} className="cat-card">
                <div className="face-placeholder" style={{ padding: 0 }}>
                  <img src={cat.image_data} alt={cat.name} style={{ width: '100%' }} />
                </div>
                <p className="cat-name">{cat.name}</p>
                <div className="card-actions">
                  <button className="action-btn star-btn" onClick={() => onStar(cat.id)}>
                    ★ {cat.stars}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatShow;