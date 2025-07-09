import React from 'react';
import styles from '../styles/ApiConfigSection.module.scss';

export const ApiConfigSection: React.FC = () => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>API Configuration</h3>
      <p className={styles.sectionText}>Configure your API settings and authentication.</p>
      
      <div className={styles.settingsGrid}>
        <div className={styles.settingItem}>
          <label className={styles.label}>API Key:</label>
          <input 
            className={styles.input} 
            type="password" 
            placeholder="Enter your API key..." 
          />
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>API Endpoint:</label>
          <input 
            className={styles.input} 
            type="url" 
            placeholder="https://api.example.com" 
            defaultValue="https://api.openai.com/v1"
          />
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>Model:</label>
          <select className={styles.select}>
            <option>GPT-4</option>
            <option>GPT-3.5-turbo</option>
            <option>Claude-3</option>
            <option>Gemini-Pro</option>
          </select>
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>Temperature:</label>
          <input 
            className={styles.input} 
            type="number" 
            min="0" 
            max="2" 
            step="0.1" 
            defaultValue="0.7"
          />
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.button}>Save Configuration</button>
          <button className={`${styles.button} ${styles.buttonSecondary}`}>Test Connection</button>
        </div>
      </div>
    </div>
  );
};
