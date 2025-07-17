import type { IChatService } from "../interfaces";
import type { AppDispatch } from "../../../store";
import {
  addMessageOptimistic,
  setConnectionStatus,
  setCurrentError,
  setTyping,
} from "../../../store/slices/chatSlice";
import {
  createAiMessage,
  createUserMessage,
} from "../../../utils/messageFactory";
import { ExtensionContext } from "../../../utils/extensionContext";

interface ConnectionState {
  status:
    | "disconnected"
    | "connecting"
    | "connected"
    | "error"
    | "reconnecting";
  lastError?: string;
  retryCount: number;
  lastConnectedAt?: Date;
  connectionAttempts: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  heartbeatInterval: number;
  connectionTimeout: number;
}

interface QueuedMessage {
  id: string;
  content: string;
  timestamp: Date;
  retryCount: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

interface WebSocketMessage {
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export class WebSocketService implements IChatService {
  private dispatch: AppDispatch;
  private sessionId: string;
  private connectionId: string;
  private retryConfig: RetryConfig;
  private connectionState: ConnectionState;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimeoutTimer: NodeJS.Timeout | null = null;
  private messageQueue: Map<string, QueuedMessage> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private isManualDisconnect = false;
  private messageListenerBound = false;

  constructor(dispatch: AppDispatch, retryConfig?: Partial<RetryConfig>) {
    this.dispatch = dispatch;
    this.sessionId = this.generateSessionId();
    this.connectionId = `ws_${this.sessionId}`;
    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      ...retryConfig,
    };

    this.connectionState = {
      status: "disconnected",
      retryCount: 0,
      connectionAttempts: 0,
    };

    this.setupMessageListener();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isExtensionContextValid(): boolean {
    return ExtensionContext.isValid();
  }

  private safeSendMessage(
    message: Record<string, unknown>,
    callback?: (response: { success?: boolean; error?: string }) => void,
  ): Promise<{ success?: boolean; error?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.isExtensionContextValid()) {
        const error = new Error("Extension context invalidated");
        console.warn("Cannot send message - extension context invalidated");
        if (callback) callback({ success: false, error: error.message });
        reject(error);
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            const error = new Error(chrome.runtime.lastError.message);
            console.error("Chrome runtime error:", error);
            if (callback) callback({ success: false, error: error.message });
            reject(error);
          } else {
            if (callback) callback(response);
            resolve(response);
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (callback) callback({ success: false, error: errorMsg });
        reject(error);
      }
    });
  }

  private setupMessageListener(): void {
    if (this.messageListenerBound) return;

    const messageHandler = (message: {
      action?: string;
      connectionId?: string;
      event?: string;
      data?: unknown;
    }) => {
      if (
        message.action === "websocket_event" &&
        message.connectionId === this.connectionId &&
        message.event
      ) {
        this.handleWebSocketEvent({ event: message.event, data: message.data });
      }
    };

    // Only add listener if extension context is valid
    if (this.isExtensionContextValid()) {
      chrome.runtime.onMessage.addListener(messageHandler);
      this.messageListenerBound = true;
    } else {
      console.warn(
        "Cannot setup message listener - extension context invalidated",
      );
    }
  }

  private handleWebSocketEvent(message: {
    event: string;
    data?: unknown;
  }): void {
    console.log(`📡 WebSocket event: ${message.event}`, message.data);

    switch (message.event) {
      case "connect":
        this.onConnected();
        break;
      case "disconnect":
        this.onDisconnected();
        break;
      case "error":
        this.onError((message.data as string) || "Unknown error");
        break;
      case "message":
        this.handleMessage(message.data);
        break;
      case "pong":
        this.onPongReceived();
        break;
    }
  }

  private onConnected(): void {
    console.log("✅ WebSocket connected successfully");
    this.clearTimeouts();

    this.connectionState = {
      status: "connected",
      retryCount: 0,
      connectionAttempts: this.connectionState.connectionAttempts + 1,
      lastConnectedAt: new Date(),
    };

    this.updateReduxConnectionStatus("connected");
    this.startHeartbeat();
    this.processMessageQueue();
    this.isManualDisconnect = false;
  }

  private onDisconnected(): void {
    console.log("❌ WebSocket disconnected");
    this.connectionState.status = "disconnected";
    this.updateReduxConnectionStatus("disconnected");
    this.stopHeartbeat();

    // Auto-reconnect if not manually disconnected and within retry limits
    if (
      !this.isManualDisconnect &&
      this.connectionState.retryCount < this.retryConfig.maxRetries
    ) {
      this.scheduleReconnect();
    } else if (this.connectionState.retryCount >= this.retryConfig.maxRetries) {
      this.onMaxRetriesReached();
    }
  }

  private onError(error: string): void {
    console.error("❌ WebSocket error:", error);
    this.connectionState = {
      ...this.connectionState,
      status: "error",
      lastError: error,
    };
    this.updateReduxConnectionStatus("error");
    this.dispatch(setCurrentError(error));
    this.rejectQueuedMessages(new Error(error));
  }

  private onMaxRetriesReached(): void {
    console.error("❌ Maximum retry attempts reached");
    this.connectionState.status = "error";
    this.updateReduxConnectionStatus("error");
    this.dispatch(
      setCurrentError("Connection failed after maximum retry attempts"),
    );
    this.rejectQueuedMessages(new Error("Maximum retry attempts reached"));
  }

  private onPongReceived(): void {
    console.log("🏓 Pong received - connection is alive");
  }

  private handleMessage(data: unknown): void {
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

        case "pong":
          this.onPongReceived();
          break;

        default:
          console.log("❓ Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  }

  private updateReduxConnectionStatus(
    status: "connected" | "disconnected" | "connecting" | "error",
  ): void {
    this.dispatch(setConnectionStatus(status));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    console.log(
      `💓 Starting heartbeat (${this.retryConfig.heartbeatInterval}ms interval)`,
    );

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.retryConfig.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      console.log("💓 Stopping heartbeat");
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private sendHeartbeat(): void {
    if (this.connectionState.status === "connected") {
      this.safeSendMessage({
        action: "websocket_ping",
        connectionId: this.connectionId,
      }).catch((error) => {
        console.warn("Failed to send heartbeat:", error);
        // If heartbeat fails due to invalid context, handle it appropriately
        if (error.message.includes("Extension context invalidated")) {
          this.handleExtensionContextInvalidated();
        } else {
          this.onError("Heartbeat failed");
        }
      });
    }
  }

  private clearTimeouts(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearTimeouts();
    this.connectionState.status = "reconnecting";
    this.updateReduxConnectionStatus("connecting");

    const delay = Math.min(
      this.retryConfig.baseDelay *
        Math.pow(
          this.retryConfig.backoffFactor,
          this.connectionState.retryCount,
        ),
      this.retryConfig.maxDelay,
    );

    console.log(
      `⏰ Scheduling reconnect in ${delay}ms (attempt ${this.connectionState.retryCount + 1}/${this.retryConfig.maxRetries})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.retryCount++;
      this.connect().catch((error) => {
        console.error("Reconnection failed:", error);
      });
    }, delay);
  }

  private processMessageQueue(): void {
    if (this.messageQueue.size === 0) return;

    console.log(`📤 Processing ${this.messageQueue.size} queued messages`);
    const queue = Array.from(this.messageQueue.values());
    this.messageQueue.clear();

    queue.forEach(({ content, resolve, reject }) => {
      this.sendMessageDirectly(content).then(resolve).catch(reject);
    });
  }

  private rejectQueuedMessages(error: Error): void {
    console.log(`❌ Rejecting ${this.messageQueue.size} queued messages`);
    const queue = Array.from(this.messageQueue.values());
    this.messageQueue.clear();

    queue.forEach(({ reject }) => reject(error));
  }

  // Public API
  get isConfigured(): boolean {
    return true;
  }

  get connectionStatus(): string {
    return this.connectionState.status;
  }

  getConnectionStats() {
    return {
      status: this.connectionState.status,
      retryCount: this.connectionState.retryCount,
      connectionAttempts: this.connectionState.connectionAttempts,
      lastConnectedAt: this.connectionState.lastConnectedAt,
      lastError: this.connectionState.lastError,
      queuedMessages: this.messageQueue.size,
    };
  }

  async connect(): Promise<void> {
    if (this.connectionState.status === "connected") {
      return Promise.resolve();
    }

    if (
      this.connectionState.status === "connecting" &&
      this.connectionPromise
    ) {
      return this.connectionPromise;
    }

    this.connectionState.status = "connecting";
    this.updateReduxConnectionStatus("connecting");
    this.isManualDisconnect = false;

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectionTimeoutTimer = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, this.retryConfig.connectionTimeout);

      const messageListener = (message: {
        action?: string;
        connectionId?: string;
        event?: string;
      }) => {
        if (
          message.action === "websocket_event" &&
          message.connectionId === this.connectionId
        ) {
          if (message.event === "connect") {
            this.clearTimeouts();
            chrome.runtime.onMessage.removeListener(messageListener);
            resolve();
          } else if (message.event === "error") {
            this.clearTimeouts();
            chrome.runtime.onMessage.removeListener(messageListener);
            reject(new Error("Connection failed"));
          }
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      this.safeSendMessage(
        {
          action: "websocket_connect",
          connectionId: this.connectionId,
          data: {
            url: "ws://localhost:3002/ws",
            sessionId: this.sessionId,
          },
        },
        (response) => {
          if (!response?.success) {
            this.clearTimeouts();
            chrome.runtime.onMessage.removeListener(messageListener);
            reject(new Error(response?.error || "Connection failed"));
          }
        },
      ).catch((error) => {
        this.clearTimeouts();
        chrome.runtime.onMessage.removeListener(messageListener);
        reject(error);
      });
    });

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  async disconnect(): Promise<void> {
    console.log("🔌 Manual disconnect requested");
    this.isManualDisconnect = true;
    this.connectionState.retryCount = this.retryConfig.maxRetries; // Prevent auto-reconnect

    this.clearTimeouts();
    this.stopHeartbeat();

    if (this.connectionState.status === "connected") {
      this.safeSendMessage({
        action: "websocket_disconnect",
        connectionId: this.connectionId,
      }).catch((error) => {
        console.warn("Failed to send disconnect message:", error);
      });
    }

    this.connectionState.status = "disconnected";
    this.updateReduxConnectionStatus("disconnected");

    // Clear message queue on manual disconnect
    this.rejectQueuedMessages(new Error("Connection manually disconnected"));
  }

  async sendMessage(content: string): Promise<void> {
    const userMessage = createUserMessage(content);
    this.dispatch(addMessageOptimistic(userMessage));

    // Queue message if not connected
    if (this.connectionState.status !== "connected") {
      return new Promise<void>((resolve, reject) => {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const queuedMessage: QueuedMessage = {
          id: messageId,
          content,
          timestamp: new Date(),
          retryCount: 0,
          resolve,
          reject,
        };

        this.messageQueue.set(messageId, queuedMessage);
        console.log(
          `📝 Message queued: ${messageId} (queue size: ${this.messageQueue.size})`,
        );

        // Try to connect if not already connecting
        if (this.connectionState.status === "disconnected") {
          this.connect().catch(() => {
            // Connection will be retried automatically
          });
        }
      });
    }

    return this.sendMessageDirectly(content);
  }

  private async sendMessageDirectly(content: string): Promise<void> {
    const messageData = {
      content,
      metadata: {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        source: "floating-widget",
      },
    };

    const response = await this.safeSendMessage({
      action: "websocket_send",
      connectionId: this.connectionId,
      data: messageData,
    });

    if (response?.success) {
      this.dispatch(setTyping(true));
    } else {
      throw new Error(response?.error || "Failed to send message");
    }
  }

  async getHistory(): Promise<unknown[]> {
    return [];
  }

  startTyping(): void {
    this.dispatch(setTyping(true));
  }

  stopTyping(): void {
    this.dispatch(setTyping(false));
  }

  // Handle extension context invalidation
  handleExtensionContextInvalidated(): void {
    console.warn(
      "🚨 Extension context invalidated - cleaning up WebSocket service",
    );
    this.isManualDisconnect = true;
    this.connectionState.status = "error";
    this.connectionState.lastError = "Extension context invalidated";
    this.updateReduxConnectionStatus("error");
    this.dispatch(
      setCurrentError(
        "Extension context invalidated - please refresh the page",
      ),
    );
    this.clearTimeouts();
    this.stopHeartbeat();
    this.rejectQueuedMessages(new Error("Extension context invalidated"));

    // Show user notification
    ExtensionContext.showContextError();
  }

  // Cleanup method
  destroy(): void {
    console.log("🧹 Destroying WebSocket service");
    this.isManualDisconnect = true;
    this.disconnect();
    this.clearTimeouts();
    this.rejectQueuedMessages(new Error("Service destroyed"));
  }
}
