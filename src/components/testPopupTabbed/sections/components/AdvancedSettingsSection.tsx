import React from 'react';
import styles from '../styles/AdvancedSettingsSection.module.scss';

export const AdvancedSettingsSection: React.FC = () => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Advanced Settings</h3>
      <p className={styles.sectionText}>Configure advanced features and debugging options.</p>
      
      <div className={styles.settingsGrid}>
        <div className={styles.settingGroup}>
          <h4 className={styles.groupTitle}>Performance</h4>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>
              <input type="checkbox" className={styles.checkbox} />
              Enable debug mode
            </label>
            <p className={styles.description}>Show detailed logs and debugging information</p>
          </div>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>
              <input type="checkbox" className={styles.checkbox} defaultChecked />
              Enable caching
            </label>
            <p className={styles.description}>Cache responses to improve performance</p>
          </div>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>Request timeout (seconds):</label>
            <input 
              className={styles.input} 
              type="number" 
              min="5" 
              max="60" 
              defaultValue="30" 
            />
            <p className={styles.description}>Maximum time to wait for API responses</p>
          </div>
        </div>
        
        <div className={styles.settingGroup}>
          <h4 className={styles.groupTitle}>Privacy & Security</h4>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>
              <input type="checkbox" className={styles.checkbox} defaultChecked />
              Encrypt stored data
            </label>
            <p className={styles.description}>Encrypt sensitive data before storing</p>
          </div>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>
              <input type="checkbox" className={styles.checkbox} />
              Auto-clear data on close
            </label>
            <p className={styles.description}>Clear all data when extension is closed</p>
          </div>
          
          <div className={styles.settingItem}>
            <label className={styles.label}>Data retention (days):</label>
            <input 
              className={styles.input} 
              type="number" 
              min="1" 
              max="365" 
              defaultValue="30" 
            />
            <p className={styles.description}>How long to keep stored data</p>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button className={styles.button}>Save Settings</button>
          <button className={`${styles.button} ${styles.buttonDanger}`}>Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
};
