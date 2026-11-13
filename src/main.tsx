import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against unhandled background/foreground transitions and network drops
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Intercept unhandled promise rejections (Firestore streaming WebChannels, IndexedDB locks, network drops on switching apps) so they never crash the UI
    console.warn('Gracefully recovered from unhandled rejection on background/app switch:', event.reason);
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg.includes('speechSynthesis') ||
      msg.includes('AudioContext')
    ) {
      event.preventDefault();
    }
  });

  // Handle tab visibility change: gracefully stop audio speech when hidden to prevent browser audio worker crashes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {
        // Ignore
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
