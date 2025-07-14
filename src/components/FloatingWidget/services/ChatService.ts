import type { IChatService } from "../interfaces";
import { useAIChat } from "../../../hooks/useAIChat";

export class ChatService implements IChatService {
  private aiChat: ReturnType<typeof useAIChat>;

  constructor(aiChat: ReturnType<typeof useAIChat>) {
    this.aiChat = aiChat;
  }

  sendMessage(message: string): void {
    this.aiChat.sendMessage(message);
  }

  get isConfigured(): boolean {
    return this.aiChat.isConfigured;
  }

  get connectionStatus(): string {
    return this.aiChat.isConfigured ? "connected" : "disconnected";
  }
}
