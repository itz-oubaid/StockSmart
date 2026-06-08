import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './pages/index.css';
import './config/i18n.js';

if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('stocksmart-theme');
  const storedLang = localStorage.getItem('stocksmart_language');
  const root = document.documentElement;
  if (storedTheme === 'dark') {
    root.classList.add('dark-theme');
    root.classList.add('dark');
  } else {
    root.classList.remove('dark-theme');
    root.classList.remove('dark');
  }
  if (storedLang) {
    root.lang = storedLang.split('-')[0];
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
