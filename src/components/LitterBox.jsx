import React from 'react';
import './LitterBox.css';

const LitterBox = ({ onBack }) => {
  return (
    <div className="app-container">
      <header className="drawing-header">
        <h1>The Litter Box</h1>
        <button onClick={onBack} style={{ marginBottom: '10px' }}>← Back to Drawing</button>
      </header>

      <div className="litter-container">
        <div className="litter-grid">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="cat-frame">
              <div className="walking-cat-body"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LitterBox;