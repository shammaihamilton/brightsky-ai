import React, { useState, useEffect } from 'react';
import { TabBar, type TabKey } from './TabBar';
import styles from './TabBar.module.css';
import { ApiConfigSection } from './sections/ApiConfigSection';
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection';
import { ChatSettingsSection } from './sections/ChatSettingsSection';
import { ToolSelectionSection } from './sections/ToolSelectionSection';

const TAB_STORAGE_KEY = 'popupTabbed.activeTab';

export const PopupTabbedPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('api');

  // Load last active tab from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TAB_STORAGE_KEY) as TabKey | null;
    if (saved && ['api','advanced','chat','tools'].includes(saved)) {
      setActiveTab(saved);
    }
  }, []);

  // Save active tab to localStorage
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  return (
    <div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={styles.tabContent}>
        {activeTab === 'api' && <ApiConfigSection />}
        {activeTab === 'advanced' && <AdvancedSettingsSection />}
        {activeTab === 'chat' && <ChatSettingsSection />}
        {activeTab === 'tools' && <ToolSelectionSection />}
      </div>
    </div>
  );
}; 