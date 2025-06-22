import * as React from 'react';
import { createRoot } from 'react-dom/client';
import FloatingWidget from '../components/FloatingWidget';

console.log('🚀 Content script starting...');

// Create widget container
const createWidget = () => {
  const container = document.createElement('div');
  container.id = 'floating-widget-root';
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    pointer-events: none !important;
    z-index: 2147483647 !important;
  `;
  
  document.body.appendChild(container);
  
  const root = createRoot(container);
  root.render(React.createElement(FloatingWidget));
  
  console.log('✅ Widget created successfully');
};

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createWidget);
} else {
  createWidget();
}
