import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './pages/index.css';

if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('stocksmart-theme');
  const root = document.documentElement;
  if (storedTheme === 'dark') {
    root.classList.add('dark-theme');
    root.classList.add('dark');
  } else {
    root.classList.remove('dark-theme');
    root.classList.remove('dark');
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
