import type { IChatService } from "../interfaces";
import { io, Socket } from 'socket.io-client';
import type { AppDispatch } from "../../../store";
import { addMessageOptimistic, setConnectionStatus, setCurrentError, setTyping } from "../../../store/slices/chatSlice";
import { createAiMessage } from "../../../utils/messageFactory";

export interface AgentResponse {
  type: 'agent_response';
  content: string;
  metadata: {
    intents: Array<{
      intent: string;
      confidence: number;
      entities: Record<string, unknown>;
    }>;
    toolsUsed: string[];
    timestamp: string;
  };
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class WebSocketChatService implements IChatService {
  private socket: ReturnType<typeof io> | null = null;
  private dispatch: AppDispatch;
  private sessionId: string;
  private retryConfig: RetryConfig;
  private retryCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private autoReconnectEnabled = true;
  private _connectionStatus: string = 'disconnected';

  constructor(dispatch: AppDispatch, retryConfig?: Partial<RetryConfig>) {
    this.dispatch = dispatch;
    this.sessionId = this.generateSessionId();
    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      ...retryConfig
    };
  }

  // Interface properties
  get isConfigured(): boolean {
    return this.socket !== null;
  }

  get connectionStatus(): string {
    return this._connectionStatus;
  }

  private updateConnectionStatus(status: string): void {
    this._connectionStatus = status;
    this.dispatch(setConnectionStatus(status as 'connected' | 'disconnected' | 'connecting' | 'error'));
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) return;

    try {
      this.updateConnectionStatus('connecting');
      
      await this.connectWithRetry();
      
    } catch (error) {
      console.error('Failed to connect after retries:', error);
      this.updateConnectionStatus('disconnected');
      this.dispatch(setCurrentError(error instanceof Error ? error.message : 'Connection failed'));
      
      if (this.autoReconnectEnabled) {
        this.scheduleReconnect();
      }
    }
  }

  private async connectWithRetry(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const attemptConnection = (attempt: number) => {
        console.log(`Connection attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}`);
        
        this.socket = io('http://localhost:3001/ws', {
          query: { sessionId: this.sessionId },
          transports: ['websocket'],
          autoConnect: true,
          timeout: 5000
        });

        this.setupSocketListeners();
        
        const connectTimeout = setTimeout(() => {
          this.socket?.disconnect();
          
          if (attempt < this.retryConfig.maxRetries) {
            const delay = Math.min(
              this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
              this.retryConfig.maxDelay
            );
            
            console.log(`Connection failed, retrying in ${delay}ms...`);
            setTimeout(() => attemptConnection(attempt + 1), delay);
          } else {
            reject(new Error(`Failed to connect after ${this.retryConfig.maxRetries + 1} attempts`));
          }
        }, 5000);

        this.socket.on('connect', () => {
          clearTimeout(connectTimeout);
          this.retryCount = 0;
          this.updateConnectionStatus('connected');
          console.log('Connected successfully');
          resolve();
        });

        this.socket.on('connect_error', (error: Error) => {
          clearTimeout(connectTimeout);
          console.error('Connection error:', error);
          
          if (attempt < this.retryConfig.maxRetries) {
            const delay = Math.min(
              this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
              this.retryConfig.maxDelay
            );
            
            console.log(`Connection failed, retrying in ${delay}ms...`);
            setTimeout(() => attemptConnection(attempt + 1), delay);
          } else {
            reject(error);
          }
        });
      };

      attemptConnection(0);
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const reconnectDelay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, this.retryCount),
      this.retryConfig.maxDelay
    );

    console.log(`Scheduling reconnect in ${reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(() => {
      if (this.autoReconnectEnabled && !this.socket?.connected) {
        this.retryCount++;
        this.connect();
      }
    }, reconnectDelay);
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.updateConnectionStatus('connected');
    });

    this.socket.on('agent_response', (response: AgentResponse) => {
      console.log('Received agent response:', response);
      const aiMessage = createAiMessage(response.content);
      this.dispatch(addMessageOptimistic(aiMessage));
    });

    this.socket.on('agent_thinking', (data: { thinking: boolean }) => {
      console.log('Agent thinking status:', data.thinking);
      this.dispatch(setTyping(data.thinking));
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.updateConnectionStatus('disconnected');
      
      if (this.autoReconnectEnabled && reason === 'io server disconnect') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.dispatch(setCurrentError(error.message));
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.updateConnectionStatus('error');
    });
  }

  disconnect(): void {
    this.autoReconnectEnabled = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.updateConnectionStatus('disconnected');
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('WebSocket not connected');
    }

    try {
      console.log('Sending message:', message);
      this.socket.emit('user_message', {
        content: message,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      this.dispatch(setCurrentError(error instanceof Error ? error.message : 'Failed to send message'));
      throw error;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for controlling auto-reconnect
  enableAutoReconnect(): void {
    this.autoReconnectEnabled = true;
  }

  disableAutoReconnect(): void {
    this.autoReconnectEnabled = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  isAutoReconnectEnabled(): boolean {
    return this.autoReconnectEnabled;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }
}
