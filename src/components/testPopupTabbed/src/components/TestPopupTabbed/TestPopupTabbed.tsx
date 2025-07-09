import React, { useState, useEffect } from 'react';
import { TestTabBar, type TabKey } from '../TestTabBar';
import { TestContent } from '../TestContent';
import styles from './TestPopupTabbed.module.scss';

const TAB_STORAGE_KEY = 'testPopupTabbed.activeTab';

export const TestPopupTabbed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('tab1');

  // Load last active tab from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey | null;
    if (saved && ['tab1', 'tab2', 'tab3', 'tab4'].includes(saved)) {
      setActiveTab(saved);
    }
  }, []);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h2 className={styles.title}>Test Popup Tabbed</h2>
      </div>
      
      <TestTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div 
        className={styles.content}
        role="tabpanel"
        id={`${activeTab}-panel`}
        aria-labelledby={`${activeTab}-tab`}
      >
        <TestContent activeTab={activeTab} />
      </div>
    </div>
  );
};
