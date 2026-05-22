import './CatShow.css';
import { isSafeToRender } from '../utils/securityHelpers';

const CatShow = ({ cats, onStar, onBack }) => {

  return (
    <div className="app-container">
      <section className="product-tile product-tile-light">
        <header className="drawing-header">
          <h1 className="hero-title">Show All Posa</h1>
          <nav className="navigation-links" style={{ justifyContent: 'center', marginBottom: 'var(--spacing-xl)' }}>
            <a className="footer-link" onClick={onBack}>← Back to Drawing</a>
          </nav>
        </header>

        <div className="gallery-container">
          {cats.length === 0 ? (
            <p className="hero-tagline" style={{ textAlign: 'center', marginTop: '20px' }}>No cats yet. Go draw one!</p>
          ) : (
            <div className="gallery-grid">
              {cats.map((cat) => (
                <div key={cat.id} className="cat-card">
                  <div className="face-placeholder">
                    <img src={cat.image_url || cat.image_data} alt={cat.name} />
                  </div>
                  <p className="cat-name">
                    {isSafeToRender(cat.name) ? cat.name : 'Unsafe name blocked'}
                  </p>
                  <div className="card-actions">
                    <button className="star-btn" onClick={() => onStar(cat.id)}>
                      ★ {cat.stars}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatShow;