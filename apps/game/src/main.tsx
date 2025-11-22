import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App.tsx';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register(import.meta.env.MODE === 'production' ? '/assets/game/sw.js' : '/dev-sw.js?dev-sw', {
      scope: '/datawar/game',
    })
    .then((registration) => {
      console.log('SW registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.error('SW registration failed:', err);
    });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
