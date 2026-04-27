import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css";

// Aplikuj polyfill dla urządzeń dotykowych
polyfill({
  dragImageTranslateOverride: "none",
  holdToDrag: 300 // Wymaga przytrzymania palca przez 300ms, co ułatwia normalne przewijanie strony
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
