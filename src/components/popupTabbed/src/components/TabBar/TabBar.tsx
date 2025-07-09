import React from 'react';
import styles from './TestTabBar.module.scss';

export type TabKey = 'tab1' | 'tab2' | 'tab3' | 'tab4';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'tab1', label: 'API Config', icon: '⚙️' },
  { key: 'tab2', label: 'Chat', icon: '💬' },
  { key: 'tab3', label: 'Tools', icon: '🛠️' },
  { key: 'tab4', label: 'Advanced', icon: '🔧' }
];

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabBar} role="tablist">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          aria-controls={`${tab.key}-panel`}
          id={`${tab.key}-tab`}
        >
          <span className={styles.tabIcon}>{tab.icon}</span>
          <span className={styles.tabLabel}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
