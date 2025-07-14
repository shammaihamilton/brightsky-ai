import type { ChatMessage, AIResponse, AIRequestOptions } from './types';

export interface IAIService {
  sendMessage(
    message: string,
    history?: ChatMessage[],
    options?: AIRequestOptions,
  ): Promise<AIResponse>;

  checkHealth(): Promise<{ success: boolean; message: string }>;
}
