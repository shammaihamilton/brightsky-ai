// Hook for real AI chat functionality in Chrome extension
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { 
  addAiResponseChunk, 
  updateMessageStatus,
  setCurrentError 
} from '../../../store/slices/chatSlice';
import { selectApiKey, selectProvider, selectMaxTokens, selectTemperature, selectTone, selectAssistantName, selectNotificationSettings } from '../../../store/selectors/settingsSelectors';
import { selectConversationHistory } from '../../../store/selectors/chatSelectors';
import { AIService, type ChatMessage } from '../../../services/aiService';
import { NotificationService } from '../../../services/notificationService';

export interface UseAIChat {
  sendMessage: (message: string, messageId: string) => Promise<void>;
  isConfigured: boolean;
}

export const useAIChat = (): UseAIChat => {  const dispatch = useAppDispatch();
    // Get settings from Redux store
  const apiKey = useAppSelector(selectApiKey);
  const provider = useAppSelector(selectProvider);
  const maxTokens = useAppSelector(selectMaxTokens);
  const temperature = useAppSelector(selectTemperature);
  const tone = useAppSelector(selectTone);
  const assistantName = useAppSelector(selectAssistantName);
  const notificationSettings = useAppSelector(selectNotificationSettings);
  const conversationHistory = useAppSelector(selectConversationHistory);
    const isConfigured = Boolean(apiKey && provider);
  
  const sendMessage = useCallback(async (message: string) => {
    if (!isConfigured) {
      dispatch(setCurrentError('AI chat is not configured. Please set up your API key in settings.'));
      return;
    }

    try {      // Create AI service instance
      const aiService = new AIService({
        provider,
        apiKey,
        maxTokens,
        temperature,
        tone,
      });

      // Convert conversation history to the format expected by AI service
      const chatHistory: ChatMessage[] = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));      // Send message with streaming support
      let completeMessage = '';
      await aiService.sendMessage(
        message,
        chatHistory,
        (chunk) => {
          // Handle streaming chunks
          completeMessage += chunk.chunk;
          dispatch(addAiResponseChunk({
            messageId: chunk.messageId,
            chunk: chunk.chunk,
            isFinal: chunk.isFinal,
          }));

          // If this is the final chunk, trigger notification
          if (chunk.isFinal && notificationSettings) {
            NotificationService.notify(completeMessage, notificationSettings, assistantName);
          }
        }
      );

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      let errorMessage = 'Failed to get AI response';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Dispatch error to Redux store
      dispatch(setCurrentError(errorMessage));
      
      // Mark the last AI message as failed if it exists
      const lastMessage = conversationHistory[conversationHistory.length - 1];
      if (lastMessage && lastMessage.sender === 'ai') {
        dispatch(updateMessageStatus({
          messageId: lastMessage.id,
          status: 'failed',
        }));
      }
    }
  }, [dispatch, isConfigured, apiKey, provider, maxTokens, temperature, tone, assistantName, notificationSettings, conversationHistory]);

  return {
    sendMessage,
    isConfigured,
  };
};
