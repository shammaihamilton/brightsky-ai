import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { ModularSettingsPanel } from './ModularSettingsPanel';
import '../styles/modular-popup.css';

const PopupAppV2: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="popup-container">
        <ModularSettingsPanel />
      </div>
    </Provider>
  );
};

export default PopupAppV2;
