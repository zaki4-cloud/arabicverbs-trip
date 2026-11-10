import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against unhandled background/foreground transitions and network drops
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    // Prevent unhandled promise errors (e.g. aborted Firestore webchannels, audio resume) from crashing the UI
    const reason = event.reason?.message || String(event.reason || '');
    if (
      reason.includes('aborted') ||
      reason.includes('offline') ||
      reason.includes('unavailable') ||
      reason.includes('AudioContext') ||
      reason.includes('play()') ||
      reason.includes('quota') ||
      reason.includes('Firestore')
    ) {
      console.warn('Recovered gracefully from non-fatal background/network event:', reason);
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (msg.includes('ResizeObserver') || msg.includes('Script error')) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
