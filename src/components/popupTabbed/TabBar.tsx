import React from 'react';
import styles from './TabBar.module.css';

export type TabKey = 'api' | 'advanced' | 'chat' | 'tools';

const TAB_LABELS: Record<TabKey, string> = {
  api: 'API',
  advanced: 'Advanced',
  chat: 'Chat',
  tools: 'Tools',
};

interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.tabBar}>
      {Object.entries(TAB_LABELS).map(([key, label]) => (
        <button
          key={key}
          className={
            styles.tabButton + (activeTab === key ? ' ' + styles.active : '')
          }
          onClick={() => onTabChange(key as TabKey)}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}; 