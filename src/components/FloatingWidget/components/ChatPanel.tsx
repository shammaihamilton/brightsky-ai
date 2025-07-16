import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectConversationHistory } from '../../../store/selectors/chatSelectors';
import styles from '../styles/ChatPanel.module.css';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { TypingIndicator } from './TypingIndicator';

interface ChatPanelProps {
  position: { x: number; y: number };
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  onClose: () => void;
  onSend: (message: string) => void;
  chatPanelRef: React.RefObject<HTMLDivElement | null>;
  isTyping?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  position,
  connectionStatus,
  onClose,
  onSend,
  chatPanelRef,
  isTyping = false,
}) => {
  const messages = useAppSelector(selectConversationHistory);

  // Dynamic height calculation (EXACT same logic as styled-components)
  const getHeightForMessageCount = (messageCount: number): string => {
    if (messageCount === 0) return '280px'; // Empty state
    if (messageCount <= 2) return '320px';  // Small conversation
    if (messageCount <= 5) return '400px';  // Medium conversation
    if (messageCount <= 10) return '480px'; // Large conversation
    return '520px'; // Very large conversation (max size)
  };

  // Connection status colors (EXACT same as styled-components)
  const getStatusColor = (): string => {
    switch (connectionStatus) {
      case 'connected':
        return '#10b981'; // colors.connection.connected
      case 'connecting':
        return '#f59e0b'; // colors.connection.connecting
      case 'disconnected':
        return '#ef4444'; // colors.connection.disconnected
      case 'error':
        return '#dc2626'; // colors.connection.error
      default:
        return '#9ca3af'; // colors.neutral.gray400
    }
  };

  // CSS Custom Properties
  const customProperties = {
    '--panel-x': `${position.x}px`,
    '--panel-y': `${position.y}px`,
    '--panel-height': getHeightForMessageCount(messages.length),
    '--status-color': getStatusColor(),
  } as React.CSSProperties;

  return (
    <div 
      className={styles.chatPanelContainer} 
      style={customProperties}
      ref={chatPanelRef}
    >
      <div className={styles.panelContent}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.pulseIndicator} />
            <h3 className={styles.headerTitle}>AI Assistant</h3>
          </div>
          <div className={styles.headerRight}>
            <ConnectionStatusIndicator showText={true} size="small" />
            <button 
              className={styles.closeButton} 
              onClick={onClose} 
              aria-label="Close chat"
              type="button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className={styles.messagesContainer}>
          <MessageList messages={messages} />
          <TypingIndicator isVisible={isTyping} />
        </div>

        {/* Input Area */}
        <div className={styles.inputContainer}>
          <ChatInput 
            onSend={onSend} 
            connectionStatus={connectionStatus}
            disabled={connectionStatus !== 'connected'}
            placeholder={
              connectionStatus === 'connecting' ? 'Connecting...' :
              connectionStatus === 'connected' ? 'Type a message...' :
              'Connection required to send messages'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
