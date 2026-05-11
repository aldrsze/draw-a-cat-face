import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Global Css reset and base styles
import App from './App.jsx' // Main component entry

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
