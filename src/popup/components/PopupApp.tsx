import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { SettingsPanel } from './SettingsPanel';
import '../styles/modular-popup.css';

const PopupApp: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="popup-container">
        <SettingsPanel />
      </div>
    </Provider>
  );
};

export default PopupApp;
