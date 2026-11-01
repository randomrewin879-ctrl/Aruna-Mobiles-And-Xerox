import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
if (typeof window !== 'undefined') {
  try {
    localStorage.clear();
  } catch (e) {
  }
  try {
    localStorage.clear();
  } catch (e) {
  }
  window.addEventListener('contextmenu', (e) => {
    if (
      e.target.tagName === 'IMG' ||
      e.target.closest('img') ||
      e.target.closest('.seal-container') ||
      e.target.closest('.sig-container') ||
      e.target.closest('.header-logo-wrap') ||
      e.target.closest('.shop-badge') ||
      e.target.closest('.invoice-page-sheet')
    ) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
  window.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' || e.target.closest('img')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
      e.preventDefault();
      return false;
    }
  });
}
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)