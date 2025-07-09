import React from 'react';
import { type TabKey } from '../TabBar';
import styles from './TabContent.module.scss';
import { 
  ApiConfigSection, 
  ChatSettingsSection, 
  ToolSelectionSection, 
  AdvancedSettingsSection 
} from '../sections';

interface TabContentProps {
  activeTab: TabKey;
}

export const TabContent: React.FC<TabContentProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'tab1':
        return <ApiConfigSection />;
      case 'tab2':
        return <ChatSettingsSection />;
      case 'tab3':
        return <ToolSelectionSection />;
      case 'tab4':
        return <AdvancedSettingsSection />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.content}>
      {renderContent()}
    </div>
  );
};
