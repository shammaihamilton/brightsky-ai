import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { setTools } from './store/slices/settingsSlice';
import { store } from './store';

const TOOL_SETTINGS_KEY = 'toolSettings';

function syncToolsFromStorageDirect(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['chatSettings'], (result) => {
        const settings = result.chatSettings || {};
        if (settings && Array.isArray(settings[TOOL_SETTINGS_KEY])) {
          store.dispatch(setTools(settings[TOOL_SETTINGS_KEY]));
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Wait for tool sync before rendering the app
syncToolsFromStorageDirect().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
  )
});
