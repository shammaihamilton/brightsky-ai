import React from 'react';
import { createRoot } from 'react-dom/client';
import PopupApp from '../popup/PopupApp';

console.log('Popup script loaded');

const container = document.getElementById('popup-root');
console.log('Container found:', container);

if (container) {
  console.log('Creating React root...');
  const root = createRoot(container);
  root.render(<PopupApp />);
  console.log('React app rendered');
} else {
  console.error('popup-root element not found');
}
