import React from 'react';
import { type TabKey } from '../TestTabBar';
import styles from './TestContent.module.scss';
import { 
  ApiConfigSection, 
  ChatSettingsSection, 
  ToolSelectionSection, 
  AdvancedSettingsSection 
} from '../sections';

interface TestContentProps {
  activeTab: TabKey;
}

export const TestContent: React.FC<TestContentProps> = ({ activeTab }) => {
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
