import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectConversationHistory } from '../../../store/selectors/chatSelectors';
import {
  ChatPanelContainer,
  PanelContent,
  PanelHeader,
  HeaderLeft,
  HeaderRight,
  HeaderTitle,
  PulseIndicator,
  ConnectionStatus,
  CloseButton,
  MessagesContainer,
  InputContainer,
} from '../styled-components';
import MessageListStyled from './MessageListStyled';
import ChatInputStyled from './ChatInputStyled';

interface ChatPanelProps {
  position: { x: number; y: number };
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  onClose: () => void;
  onSend: (message: string) => void;
  chatPanelRef: React.RefObject<HTMLDivElement | null>;
}

const ChatPanelStyled: React.FC<ChatPanelProps> = ({
  position,
  connectionStatus,
  onClose,
  onSend,
  chatPanelRef,
}) => {
  const messages = useAppSelector(selectConversationHistory);

  return (
    <ChatPanelContainer ref={chatPanelRef} position={position}>
      <PanelContent>
        {/* Header */}
        <PanelHeader>
          <HeaderLeft>
            <PulseIndicator />
            <HeaderTitle>AI Assistant</HeaderTitle>
          </HeaderLeft>
          <HeaderRight>
            <ConnectionStatus status={connectionStatus} />
            <CloseButton onClick={onClose} aria-label="Close chat">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </CloseButton>
          </HeaderRight>
        </PanelHeader>

        {/* Messages Container */}
        <MessagesContainer>
          <MessageListStyled messages={messages} />
        </MessagesContainer>

        {/* Input Area */}
        <InputContainer>
          <ChatInputStyled onSend={onSend} connectionStatus={connectionStatus} />
        </InputContainer>
      </PanelContent>
    </ChatPanelContainer>
  );
};

export default ChatPanelStyled;
