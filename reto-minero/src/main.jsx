import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter';
import '@fontsource/jetbrains-mono';
import 'material-symbols/outlined.css';
import './index.css';
import App from './App.jsx';
import { MinaProvider } from './context/MinaContext.jsx';
import { registerSW } from 'virtual:pwa-register';

// Registro PWA automático offline mediante vite-plugin-pwa
if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MinaProvider>
      <App />
    </MinaProvider>
  </StrictMode>
);
