
// ===== bridge/ChromeExtensionBridge.ts =====
export class ChromeExtensionBridge {
  private connectionId: string;
  private sessionId: string;
  private messageHandler: ((message: Record<string, unknown>) => void) | null = null;
  private isListening = false;

  constructor(connectionId: string, sessionId: string) {
    this.connectionId = connectionId;
    this.sessionId = sessionId;
  }

  sendMessage(message: Record<string, unknown>): Promise<{ success?: boolean; error?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.isExtensionContextValid()) {
        reject(new Error("Extension context invalidated"));
        return;
      }

      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  startListening(onMessage: (event: string, data?: unknown) => void): void {
    if (this.isListening) return;

    this.messageHandler = (message: {
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
        onMessage(message.event, message.data);
      }
    };

    if (this.isExtensionContextValid()) {
      chrome.runtime.onMessage.addListener(this.messageHandler);
      this.isListening = true;
    }
  }

  stopListening(): void {
    if (this.messageHandler && this.isListening) {
      chrome.runtime.onMessage.removeListener(this.messageHandler);
      this.isListening = false;
      this.messageHandler = null;
    }
  }

  async connect(url: string): Promise<void> {
    const response = await this.sendMessage({
      action: "websocket_connect",
      connectionId: this.connectionId,
      data: { url, sessionId: this.sessionId },
    });

    if (!response?.success) {
      throw new Error(response?.error || "Connection failed");
    }
  }

  async disconnect(): Promise<void> {
    await this.sendMessage({
      action: "websocket_disconnect",
      connectionId: this.connectionId,
    });
  }

  async send(data: Record<string, unknown>): Promise<void> {
    const response = await this.sendMessage({
      action: "websocket_send",
      connectionId: this.connectionId,
      data,
    });

    if (!response?.success) {
      throw new Error(response?.error || "Failed to send message");
    }
  }

  async ping(): Promise<void> {
    await this.sendMessage({
      action: "websocket_ping",
      connectionId: this.connectionId,
    });
  }

  private isExtensionContextValid(): boolean {
    return typeof chrome !== "undefined" && chrome.runtime && !chrome.runtime.lastError;
  }
}