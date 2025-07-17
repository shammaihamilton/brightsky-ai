import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { PopupTabbed } from './src/components';

// Find the root element
const container = document.getElementById('popup-root');
if (!container) {
  throw new Error('Popup root element not found');
}

// Create root and render with Redux Provider
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <PopupTabbed />
  </Provider>
);
