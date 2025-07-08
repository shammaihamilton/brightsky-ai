import { createRoot } from 'react-dom/client';
import PopupApp from './components/PopupApp';
import './styles/popup.css';  
const container = document.getElementById('popup-root');

if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
} else {
  console.error('popup-root element not found');
}
