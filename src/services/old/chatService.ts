export interface ChatServiceConfig {
  backendUrl: string;
  timeout: number;
  maxRetries: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  provider: string;
  directDbAccess?: boolean;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    processingTime?: number;
    mode?: string;
    availableTools?: string[];
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ChatService {
  private config: ChatServiceConfig;

  constructor(config: Partial<ChatServiceConfig> = {}) {
    this.config = {
      backendUrl: config.backendUrl || "http://localhost:3001",
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
    };
  }

  async sendMessage(
    message: string,
    history: ChatMessage[],
    options: {
      provider?: string;
      directDbAccess?: boolean;
      onChunk?: (chunk: string) => void;
    } = {},
  ): Promise<string> {
    const requestData: ChatRequest = {
      message,
      history,
      provider: options.provider || "openai",
      directDbAccess: options.directDbAccess || false,
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(requestData, options.onChunk);

        if (!response.success) {
          throw new Error(response.error || "Unknown server error");
        }

        return response.response || "";
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.config.maxRetries) {
          break;
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    throw lastError || new Error("Maximum retries exceeded");
  }

  async checkHealth(): Promise<{
    success: boolean;
    availableTools: string[];
    version: string;
  }> {
    try {
      const response = await fetch(
        `${this.config.backendUrl}/api/chat/health`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        availableTools: data.availableTools || [],
        version: data.version || "1.0.0",
      };
    } catch (error) {
      console.error("[ChatService] Health check failed:", error);
      return {
        success: false,
        availableTools: [],
        version: "unknown",
      };
    }
  }

  private async makeRequest(
    requestData: ChatRequest,
    onChunk?: (chunk: string) => void,
  ): Promise<ChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle streaming response (if implemented later)
      if (onChunk && response.body) {
        return await this.handleStreamingResponse(response, onChunk);
      }

      const data = await response.json();
      return data as ChatResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async handleStreamingResponse(
    response: Response,
    onChunk: (chunk: string) => void,
  ): Promise<ChatResponse> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              return { success: true, response: fullResponse };
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullResponse += parsed.chunk;
                onChunk(parsed.chunk);
              }
            } catch (e) {
              console.warn("Failed to parse streaming chunk:", e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { success: true, response: fullResponse };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
