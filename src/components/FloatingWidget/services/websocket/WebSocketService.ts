
// ===== WebSocketService.ts =====
import type { IChatService, RetryConfig } from './types';
import { ConnectionManager } from './managers/ConnectionManager';
import { MessageQueueManager } from './managers/MessageQueueManager';
import { HeartbeatManager } from './managers/HeartbeatManager';
import { MessageHandler } from './managers/MessageHandler';
import { ChromeExtensionBridge } from './bridge/ChromeExtensionBridge';
import { setConnectionStatus, setCurrentError, setTyping, addMessageOptimistic } from '../../../../store/slices/chatSlice';
import { createUserMessage } from '../../../../utils/messageFactory';
import type { AppDispatch } from "../../../../store";



export class WebSocketService implements IChatService {
  private dispatch: AppDispatch;
  private sessionId: string;
  private connectionId: string;
  private connectionManager: ConnectionManager;
  private messageQueue: MessageQueueManager;
  private heartbeat: HeartbeatManager;
  private messageHandler: MessageHandler;
  private bridge: ChromeExtensionBridge;
  private connectionPromise: Promise<void> | null = null;

  constructor(dispatch: AppDispatch, retryConfig?: Partial<RetryConfig>) {
    this.dispatch = dispatch;
    this.sessionId = this.generateSessionId();
    this.connectionId = `ws_${this.sessionId}`;

    const config: RetryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      heartbeatInterval: 30000,
      connectionTimeout: 10000,
      maxMissedHeartbeats: 3,
      messageTimeout: 30000,
      ...retryConfig,
    };

    // Initialize components
    this.connectionManager = new ConnectionManager(config, (state) => {
      // Map "reconnecting" to "connecting" for type compatibility
      const mappedStatus =
        state.status === "reconnecting" ? "connecting" : state.status;
      this.dispatch(setConnectionStatus(mappedStatus));
      if (state.lastError) {
        this.dispatch(setCurrentError(state.lastError));
      }
    });

    this.messageQueue = new MessageQueueManager();
    this.messageHandler = new MessageHandler(dispatch);
    this.bridge = new ChromeExtensionBridge(this.connectionId, this.sessionId);

    this.heartbeat = new HeartbeatManager(
      config.heartbeatInterval,
      () => this.sendHeartbeat(),
      () => this.handleMissedHeartbeat()
    );

    this.setupEventHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventHandlers(): void {
    this.bridge.startListening((event, data) => {
      switch (event) {
        case "connect":
          this.onConnected();
          break;
        case "disconnect":
          this.onDisconnected();
          break;
        case "error":
          this.onError((data as string) || "Unknown error");
          break;
        case "message":
          this.messageHandler.handle(data);
          break;
        case "pong":
          this.connectionManager.resetHeartbeat();
          break;
      }
    });
  }

  private onConnected(): void {
    console.log("✅ WebSocket connected successfully");
    this.connectionManager.setConnected();
    this.heartbeat.start();
    this.messageQueue.processAll((content) => this.sendMessageDirectly(content));
  }

  private onDisconnected(): void {
    console.log("❌ WebSocket disconnected");
    this.connectionManager.setDisconnected();
    this.heartbeat.stop();

    if (this.connectionManager.shouldReconnect()) {
      this.connectionManager.scheduleReconnect(() => this.connect());
    }
  }

  private onError(error: string): void {
    console.error("❌ WebSocket error:", error);
    this.connectionManager.setError(error);
    this.messageQueue.rejectAll(new Error(error));
  }

  private sendHeartbeat(): void {
    if (this.connectionManager.isConnected) {
      this.bridge.ping().catch(() => {
        if (this.connectionManager.incrementMissedHeartbeats()) {
          this.onError("Too many missed heartbeats");
        }
      });
    }
  }

  private handleMissedHeartbeat(): void {
    if (this.connectionManager.incrementMissedHeartbeats()) {
      this.onError("Connection lost - too many missed heartbeats");
    }
  }

  // Public API
  get isConfigured(): boolean {
    return true;
  }

  get connectionStatus(): string {
    return this.connectionManager.state.status;
  }

  async connect(): Promise<void> {
    if (this.connectionManager.isConnected) return;
    if (this.connectionManager.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionManager.setConnecting();
    this.connectionPromise = this.bridge.connect("ws://localhost:3002/ws");
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  async disconnect(): Promise<void> {
    this.connectionManager.setManualDisconnect();
    this.heartbeat.stop();
    await this.bridge.disconnect();
    this.connectionManager.setDisconnected();
    this.messageQueue.rejectAll(new Error("Connection manually disconnected"));
  }

  async sendMessage(content: string): Promise<void> {
    const userMessage = createUserMessage(content);
    this.dispatch(addMessageOptimistic(userMessage));

    if (!this.connectionManager.isConnected) {
      return new Promise<void>((resolve, reject) => {
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.messageQueue.add({
          id: messageId,
          content,
          timestamp: new Date(),
          retryCount: 0,
          resolve,
          reject,
        });

        if (this.connectionManager.state.status === "disconnected") {
          this.connect().catch(() => {});
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

    await this.bridge.send(messageData);
    this.dispatch(setTyping(true));
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

  destroy(): void {
    console.log("🧹 Destroying WebSocket service");
    this.connectionManager.setManualDisconnect();
    this.heartbeat.stop();
    this.bridge.stopListening();
    this.messageQueue.rejectAll(new Error("Service destroyed"));
    this.connectionManager.destroy();
  }
}