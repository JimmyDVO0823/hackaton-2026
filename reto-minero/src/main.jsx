import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './index.css';
import App from './App.jsx';
import { MinaProvider } from './context/MinaContext.jsx';

// Registro de Service Worker para funcionamiento Offline PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('PWA Service Worker registrado:', reg.scope))
      .catch((err) => console.warn('Fallo registro Service Worker:', err));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MinaProvider>
      <App />
    </MinaProvider>
  </StrictMode>
);
