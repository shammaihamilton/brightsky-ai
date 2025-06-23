// /components/Chat/MessageList/MessageList.tsx
import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { 
  selectConversationHistory, 
  selectIsAiLoading, 
  selectCurrentError 
} from '../../../store/selectors/chatSelectors';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { useMessageListItems } from './useMessageListItems';

const MessageList: React.FC = () => {
  const messages = useAppSelector(selectConversationHistory);
  const isLoading = useAppSelector(selectIsAiLoading);
  const error = useAppSelector(selectCurrentError);
  
  // Custom hook to combine messages with loading/error states
  const listItems = useMessageListItems(messages, isLoading, error);
  
  return (
    <div className="flex-grow overflow-hidden bg-gray-50 dark:bg-gray-900">
      <VirtualizedMessageList items={listItems} />
    </div>
  );
};

export default MessageList;