import { createRoot } from 'react-dom/client';
import { TestPopupTabbed } from './index';

// Find the root element
const container = document.getElementById('popup-root');
if (!container) {
  throw new Error('Popup root element not found');
}

// Create root and render
const root = createRoot(container);
root.render(<TestPopupTabbed />);
