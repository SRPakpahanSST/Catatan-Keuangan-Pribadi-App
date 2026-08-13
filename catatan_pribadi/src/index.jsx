import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

// import style
import './styles/style.css';
import './styles/custom.css'; // ← Baris ini WAJIB ada

const root = createRoot(document.getElementById('root'));
root.render(<App />);