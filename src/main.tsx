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
          console.log('[main.tsx] Synced tools from storage:', settings[TOOL_SETTINGS_KEY]);
        } else {
          console.log('[main.tsx] No tool settings found in storage.');
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

// --- TEST: Log Open-Meteo API data for Paris on startup ---
// fetch('https://geocoding-api.open-meteo.com/v1/search?name=Paris&count=1')
//   .then(res => res.json())
//   .then(geoData => {
//     console.log('[Test] Geocoding API data for Paris:', geoData);
//     if (geoData.results && geoData.results.length > 0) {
//       const { latitude, longitude } = geoData.results[0];
//       return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
//     }
//     throw new Error('No geocoding results');
//   })
//   .then(res => res.json())
//   .then(weatherData => {
//     console.log('[Test] Weather API data for Paris:', weatherData);
//   })
//   .catch(err => {
//     console.error('[Test] Weather API test error:', err);
//   });
// --- END TEST ---
