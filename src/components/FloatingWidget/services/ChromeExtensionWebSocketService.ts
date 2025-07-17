import type { IChatService } from "../interfaces";
import type { AppDispatch } from "../../../store";
import { addMessageOptimistic, setConnectionStatus, setCurrentError, setTyping } from "../../../store/slices/chatSlice";
import { createAiMessage } from "../../../utils/messageFactory";
import { store } from "../../../store";

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface WebSocketResponseMessage {
  type: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

export class ChromeExtensionWebSocketService implements IChatService {
  private dispatch: AppDispatch;
  private sessionId: string;
  private retryConfig: RetryConfig;
  private retryCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private autoReconnectEnabled = true;
  private _connectionStatus: string = 'disconnected';
  private connectionId: string;

  constructor(dispatch: AppDispatch, retryConfig?: Partial<RetryConfig>) {
    this.dispatch = dispatch;
    this.sessionId = this.generateSessionId();
    this.connectionId = `ws_${this.sessionId}`;
    this.retryConfig = {
      maxRetries: 5,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffFactor: 2,
      ...retryConfig
    };

    // Listen for WebSocket events from background script
    chrome.runtime.onMessage.addListener((message) => {
      console.log('📨 Content script received message:', message);
      if (message.action === 'websocket_event' && message.connectionId === this.connectionId) {
        console.log('📨 Processing websocket event:', message.event);
        this.handleWebSocketEvent(message);
      }
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleWebSocketEvent(message: { event: string; data?: unknown }): void {
    switch (message.event) {
      case 'connect':
        this.retryCount = 0;
        this.updateConnectionStatus('connected');
        console.log('✅ Chrome Extension WebSocket connected successfully');
        break;
        
      case 'disconnect':
        this.updateConnectionStatus('disconnected');
        console.log('❌ Chrome Extension WebSocket disconnected');
        if (this.autoReconnectEnabled) {
          this.scheduleReconnect();
        }
        break;
        
      case 'error':
        console.error('❌ Chrome Extension WebSocket error:', message.data);
        this.updateConnectionStatus('error');
        this.dispatch(setCurrentError('WebSocket connection error'));
        break;
        
      case 'message':
        try {
          // Handle both string and already parsed data
          let data: WebSocketResponseMessage;
          if (typeof message.data === 'string') {
            data = JSON.parse(message.data);
          } else if (typeof message.data === 'object' && message.data !== null) {
            data = message.data as WebSocketResponseMessage;
          } else {
            throw new Error('Invalid message data format');
          }
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
        break;
    }
  }

  private handleMessage(data: WebSocketResponseMessage): void {
    console.log('📨 Received message:', data);
    
    switch (data.type) {
      case 'session_connected':
        console.log('✅ Session connected:', data.metadata?.sessionId);
        // Handle session connection if needed
        break;
        
      case 'agent_response':
        if (data.content) {
          this.dispatch(setTyping(false));
          const aiMessage = createAiMessage(data.content);
          this.dispatch(addMessageOptimistic(aiMessage));
        }
        break;
        
      case 'agent_thinking':
        this.dispatch(setTyping(Boolean(data.metadata?.thinking)));
        break;
        
      case 'error':
        this.dispatch(setCurrentError(data.content || 'Unknown error'));
        this.dispatch(setTyping(false));
        break;
        
      case 'tool_call':
        console.log('🔧 Tool call:', data.metadata);
        // Handle tool call notifications if needed
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  get isConfigured(): boolean {
    return true; // Always configured for Chrome extension
  }

  get connectionStatus(): string {
    return this._connectionStatus;
  }

  private updateConnectionStatus(status: string): void {
    this._connectionStatus = status;
    this.dispatch(setConnectionStatus(status as 'connected' | 'disconnected' | 'connecting' | 'error'));
  }

  async connect(): Promise<void> {
    if (this._connectionStatus === 'connected') return;

    try {
      this.updateConnectionStatus('connecting');
      console.log('🔌 Chrome Extension attempting WebSocket connection via background script');
      
      await this.connectViaBackground();
      
    } catch (error) {
      console.error('Failed to connect via background script:', error);
      this.updateConnectionStatus('disconnected');
      this.dispatch(setCurrentError(error instanceof Error ? error.message : 'Connection failed'));
      
      if (this.autoReconnectEnabled) {
        this.scheduleReconnect();
      }
    }
  }

  private async connectViaBackground(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      // Create a temporary listener for connection events
      const messageListener = (message: { action?: string; connectionId?: string; event?: string; data?: unknown }) => {
        console.log('📨 Connect listener received message:', message);
        if (message.action === 'websocket_event' && message.connectionId === this.connectionId) {
          console.log('📨 Connect listener processing event:', message.event);
          if (message.event === 'connect') {
            chrome.runtime.onMessage.removeListener(messageListener);
            console.log('✅ Connection established, resolving promise');
            resolve();
          } else if (message.event === 'error') {
            chrome.runtime.onMessage.removeListener(messageListener);
            console.log('❌ Connection error, rejecting promise');
            reject(new Error('WebSocket connection failed'));
          }
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      // Send connection request with session info
      chrome.runtime.sendMessage({
        action: 'websocket_connect',
        connectionId: this.connectionId,
        data: {
          url: 'ws://localhost:3002',
          sessionId: this.sessionId
        }
      }, (response: { success: boolean; error?: string }) => {
        if (chrome.runtime.lastError) {
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (!response.success) {
          chrome.runtime.onMessage.removeListener(messageListener);
          reject(new Error(response.error || 'Failed to connect via background script'));
        }
        // If successful, wait for the websocket_event
      });

      // Set timeout to avoid hanging forever
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);
        reject(new Error('Connection timeout'));
      }, 10000);
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

    console.log(`⏰ Scheduling reconnect in ${reconnectDelay}ms...`);

    this.reconnectTimer = setTimeout(() => {
      this.retryCount++;
      if (this.retryCount <= this.retryConfig.maxRetries) {
        console.log(`🔄 Reconnection attempt ${this.retryCount}/${this.retryConfig.maxRetries}`);
        this.connect();
      } else {
        console.error('❌ Max reconnection attempts reached');
        this.updateConnectionStatus('error');
        this.dispatch(setCurrentError('Maximum reconnection attempts reached'));
      }
    }, reconnectDelay);
  }

  async disconnect(): Promise<void> {
    this.autoReconnectEnabled = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this._connectionStatus === 'connected') {
      chrome.runtime.sendMessage({
        action: 'websocket_disconnect',
        connectionId: this.connectionId
      });
    }

    this.updateConnectionStatus('disconnected');
  }

  async sendMessage(content: string): Promise<void> {
    console.log('📤 Attempting to send message, connection status:', this._connectionStatus);
    
    // Auto-connect if not connected
    if (this._connectionStatus !== 'connected') {
      console.log('🔌 Auto-connecting before sending message...');
      await this.connect();
      
      // Wait for connection to be established
      let retries = 0;
      const maxRetries = 10;
      while (this._connectionStatus !== 'connected' && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
        console.log(`⏳ Waiting for connection... (${retries}/${maxRetries})`);
      }
      
      if (this._connectionStatus !== 'connected') {
        throw new Error('Failed to establish connection before sending message');
      }
    }

    const state = store.getState();
    const selectedModel = state.settings.backendModel;

    // Format message for raw WebSocket backend
    const messageData = {
      content,
      metadata: {
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        source: 'floating-widget',
        modelPreference: selectedModel,
        provider: 'openai',
        userId: 'extension-user'
      }
    };

    console.log('📤 Sending message via background script:', messageData);

    return new Promise<void>((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'websocket_send',
        connectionId: this.connectionId,
        data: messageData
      }, (response: { success: boolean; error?: string }) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (response.success) {
          this.dispatch(setTyping(true));
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to send message'));
        }
      });
    });
  }

  async getHistory(): Promise<unknown[]> {
    return [];
  }

  startTyping(): void {
    // Implementation for typing indicator
  }

  stopTyping(): void {
    // Implementation for typing indicator
  }
}
