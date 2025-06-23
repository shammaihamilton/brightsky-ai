import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessageOptimistic, queueMessage } from '@/store/slices/chatSlice';
import type { ConnectionStatus } from '@/types/chat.types';
import { selectPrivacySettings } from '@/store/selectors/settingsSelectors';
import { createUserMessage, createQueuedMessage } from '@/utils/messageFactory'; // ✅ Import message factory

interface ChatInputProps {
  connectionStatus: ConnectionStatus;
  onSend: (text: string, id: string) => void;
}

const MAX_CHARS = 2000;

const ChatInput = ({ connectionStatus, onSend }: ChatInputProps) => {
  const dispatch = useAppDispatch();
  const [inputText, setInputText] = useState('');
  const { saveHistory } = useAppSelector(selectPrivacySettings);

  const isOffline = connectionStatus === 'disconnected';
  const canQueueOffline = saveHistory;
  const isDisabled =
    connectionStatus === 'connecting' || (isOffline && !canQueueOffline);
  const canSend = inputText.trim().length > 0 && !isDisabled;

  const handleSend = () => {
    const textToSend = inputText.trim();
    if (!textToSend || isDisabled) return;
    setInputText('');

    if (!isOffline) {
      const userMessage = createUserMessage(textToSend);
      console.log(userMessage)
      dispatch(addMessageOptimistic(userMessage));
      console.log('Sending online...');
      onSend(textToSend, userMessage.id);
    } else if (canQueueOffline) {
      const queuedMessage = createQueuedMessage(textToSend);
      dispatch(queueMessage(queuedMessage));
      dispatch(addMessageOptimistic(queuedMessage)); 
      console.log('Queued offline message:', queuedMessage);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        handleSend();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value.slice(0, MAX_CHARS)); // Enforce max length
  };

  return (
    <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-end space-x-2">
        <button
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none disabled:opacity-50"
          disabled={isDisabled}
          aria-label="Attach file"
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>

        <div className="flex-grow relative">
          <TextareaAutosize
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isOffline && !canQueueOffline
                ? 'Offline - Cannot send messages'
                : isOffline && canQueueOffline
                ? 'Offline - Message will be sent later...'
                : 'Type your message...'
            }
            className="w-full p-2 pr-10 border rounded-md resize-none bg-white dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
            minRows={1}
            maxRows={5}
            aria-label="Chat message input"
            disabled={isDisabled}
            inputMode="text"
            enterKeyHint="send"
          />
          <span
            className={`absolute bottom-1 right-2 text-xs ${
              inputText.length > MAX_CHARS - 50
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {inputText.length}/{MAX_CHARS}
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-opacity"
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

ChatInput.displayName = 'ChatInput';
export default ChatInput;

