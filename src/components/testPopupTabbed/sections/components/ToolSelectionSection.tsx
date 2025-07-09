import React from 'react';
import styles from '../styles/ToolSelectionSection.module.scss';

export const ToolSelectionSection: React.FC = () => {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Tool Selection</h3>
      <p className={styles.sectionText}>Enable and configure available tools for your AI assistant.</p>
      
      <div className={styles.toolsGrid}>
        <div className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <span className={styles.toolIcon}>🌤️</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Weather</span>
              <span className={styles.toolDescription}>Get current weather information</span>
            </div>
          </div>
          <div className={styles.toolActions}>
            <button className={`${styles.toolButton} ${styles.enabled}`}>Enabled</button>
            <button className={styles.configButton}>⚙️</button>
          </div>
        </div>
        
        <div className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <span className={styles.toolIcon}>🔍</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Web Search</span>
              <span className={styles.toolDescription}>Search the internet for information</span>
            </div>
          </div>
          <div className={styles.toolActions}>
            <button className={styles.toolButton}>Enable</button>
            <button className={styles.configButton}>⚙️</button>
          </div>
        </div>
        
        <div className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <span className={styles.toolIcon}>📅</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calendar</span>
              <span className={styles.toolDescription}>Manage calendar events and schedules</span>
            </div>
          </div>
          <div className={styles.toolActions}>
            <button className={styles.toolButton}>Enable</button>
            <button className={styles.configButton}>⚙️</button>
          </div>
        </div>
        
        <div className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <span className={styles.toolIcon}>📝</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Notes</span>
              <span className={styles.toolDescription}>Create and manage notes</span>
            </div>
          </div>
          <div className={styles.toolActions}>
            <button className={`${styles.toolButton} ${styles.enabled}`}>Enabled</button>
            <button className={styles.configButton}>⚙️</button>
          </div>
        </div>
        
        <div className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <span className={styles.toolIcon}>🧮</span>
            <div className={styles.toolInfo}>
              <span className={styles.toolName}>Calculator</span>
              <span className={styles.toolDescription}>Perform mathematical calculations</span>
            </div>
          </div>
          <div className={styles.toolActions}>
            <button className={styles.toolButton}>Enable</button>
            <button className={styles.configButton}>⚙️</button>
          </div>
        </div>
      </div>
    </div>
  );
};
