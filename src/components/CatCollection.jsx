import './CatCollection.css';
import { isSafeToRender } from '../utils/securityHelpers';

const CatCollection = ({ cats, onBack }) => {
  return (
    <div className="app-container">
      <section className="product-tile product-tile-parchment">
        <header className="drawing-header">
          <h1 className="hero-title">Posa Collection</h1>
          <nav className="navigation-links" style={{ justifyContent: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <a className="footer-link" onClick={onBack}>← Back to Drawing</a>
          </nav>
        </header>

        <div className="collection-container">
          {cats && cats.length > 0 ? (
            <div className="collection-grid">
              {cats.map((cat) => (
                <div key={cat.id} className="collection-card">
                  <div className="cat-frame" style={{ '--cat-color': cat.color || '#111' }}>
                    <div className="cat-render-container">
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
                  </div>

                  <p className="collection-cat-name">
                    {isSafeToRender(cat.name) ? cat.name : 'Unsafe name blocked'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="hero-tagline" style={{ textAlign: 'center', marginTop: '20px' }}>The collection is empty. Go draw some cats!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatCollection;