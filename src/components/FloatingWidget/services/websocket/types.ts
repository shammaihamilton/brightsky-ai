export interface ConnectionState {
  status: "disconnected" | "connecting" | "connected" | "error" | "reconnecting";
  lastError?: string;
  retryCount: number;
  lastConnectedAt?: Date;
  connectionAttempts: number;
  missedHeartbeats: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  heartbeatInterval: number;
  connectionTimeout: number;
  maxMissedHeartbeats: number;
  messageTimeout: number;
}

export interface QueuedMessage {
  id: string;
  content: string;
  timestamp: Date;
  retryCount: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

export interface WebSocketMessage {
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export interface IChatService {
  isConfigured: boolean;
  connectionStatus: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(content: string): Promise<void>;
  getHistory(): Promise<unknown[]>;
  startTyping(): void;
  stopTyping(): void;
  destroy(): void;
}