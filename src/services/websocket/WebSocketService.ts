type Listener = (...args: unknown[]) => void;

class SimpleEventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  emit(event: string, ...args: unknown[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(...args));
  }
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
  metadata?: Record<string, unknown>;
}

export interface WebSocketMessage {
  type: "chat" | "tool" | "status" | "error";
  data: ChatMessage | ToolData | StatusData | ErrorData | ChatRequestData;
  id?: string;
}

export interface ToolData {
  tools: Array<{
    name: string;
    description: string;
    aliases: string[];
  }>;
  timestamp: Date;
}

export interface StatusData {
  message?: string;
  isTyping?: boolean;
  timestamp?: Date;
}

export interface ErrorData {
  message: string;
  error?: string;
  timestamp?: Date;
}

export interface ChatRequestData {
  message: string;
  history: ChatMessage[];
  timestamp: Date;
}

type WebSocketMessageData =
  | ChatMessage
  | ToolData
  | StatusData
  | ErrorData
  | ChatRequestData;

export class WebSocketService extends SimpleEventEmitter {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private baseUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 2000;
  private isConnectedState = false;

  private constructor(baseUrl: string) {
    super();
    this.baseUrl = baseUrl;
    this.connect();
  }

  public static getInstance(
    baseUrl = "ws://localhost:3001/chat",
  ): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService(baseUrl);
    }
    return WebSocketService.instance;
  }

  private connect(): void {
    this.socket = new WebSocket(this.baseUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.isConnectedState = true;
      this.emit("open");
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected");
      this.isConnectedState = false;
      this.emit("close");
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.isConnectedState = false;
      this.emit("error", error);
    };
  }

  private handleIncomingMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "chat":
        this.emit("chatMessage", message.data);
        break;
      case "tool":
        this.emit("toolUpdate", message.data);
        break;
      case "status":
        this.emit("statusUpdate", message.data);
        break;
      case "error":
        this.emit("error", message.data);
        break;
    }
  }

  public sendMessage(
    type: "chat" | "tool" | "status" | "error",
    data: WebSocketMessageData,
  ): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected.");
    }
  }

  public isConnected(): boolean {
    return this.isConnectedState;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
