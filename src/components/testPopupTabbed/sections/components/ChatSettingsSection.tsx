import React from 'react';
import styles from '../styles/ChatSettingsSection.module.scss';

export const ChatSettingsSection: React.FC = () => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Chat Settings</h3>
      <p className={styles.sectionText}>Configure your chat behavior and preferences.</p>
      
      <div className={styles.chatSettings}>
        <div className={styles.settingItem}>
          <label className={styles.label}>
            <input type="checkbox" className={styles.checkbox} defaultChecked />
            Enable auto-responses
          </label>
          <p className={styles.description}>Automatically respond to user messages</p>
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>
            <input type="checkbox" className={styles.checkbox} defaultChecked />
            Save conversation history
          </label>
          <p className={styles.description}>Keep chat history for future reference</p>
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>
            <input type="checkbox" className={styles.checkbox} />
            Enable message timestamps
          </label>
          <p className={styles.description}>Show timestamps on messages</p>
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>Max messages in history:</label>
          <input 
            className={styles.input} 
            type="number" 
            min="10" 
            max="1000" 
            defaultValue="100" 
          />
          <p className={styles.description}>Maximum number of messages to keep</p>
        </div>
        
        <div className={styles.settingItem}>
          <label className={styles.label}>Response delay (seconds):</label>
          <input 
            className={styles.input} 
            type="number" 
            min="0" 
            max="10" 
            step="0.5" 
            defaultValue="1.5" 
          />
          <p className={styles.description}>Delay before auto-response</p>
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.button}>Save Settings</button>
          <button className={`${styles.button} ${styles.buttonSecondary}`}>Clear History</button>
        </div>
      </div>
    </div>
  );
};
