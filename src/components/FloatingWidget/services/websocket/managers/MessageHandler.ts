// ===== managers/MessageHandler.ts =====
import type { WebSocketMessage } from "../types";
import {
  setTyping,
  addMessageOptimistic,
  setCurrentError,
} from "../../../../../store/slices/chatSlice";
import { createAiMessage } from "../../../../../utils/messageFactory";
import type { AppDispatch } from "@/store";

export class MessageHandler {
  private dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  handle(data: unknown): void {
    try {
      const message: WebSocketMessage =
        typeof data === "string"
          ? JSON.parse(data)
          : (data as WebSocketMessage);

      switch (message.type) {
        case "session_connected":
          console.log("🎯 Session connected:", message.metadata?.sessionId);
          break;

        case "agent_response":
          if (message.content) {
            this.dispatch(setTyping(false));
            const aiMessage = createAiMessage(message.content);
            this.dispatch(addMessageOptimistic(aiMessage));
          }
          break;

        case "agent_thinking":
          this.dispatch(setTyping(Boolean(message.metadata?.thinking)));
          break;

        case "error":
          this.dispatch(setCurrentError(message.content || "Unknown error"));
          this.dispatch(setTyping(false));
          break;

        case "tool_call":
          console.log("🔧 Tool call received:", message.metadata);
          break;

        default:
          console.log("❓ Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  }
}
