// MCPClientAIService.ts
import type { IAIService } from "../ai/interfaces/IAIService";
import type { ChatMessage } from "../ai/interfaces/types";
import { ResponseProcessorRegistry } from "./processors";

interface ToolResult<T = unknown> {
  success: boolean;
  data: {
    results: T;
  };
  error?: string;
}

interface MCPClientConfig {
  backendUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

type LoadingCallback = (loading: boolean, toolName?: string) => void;

export class MCPClient implements IAIService {
  private config: MCPClientConfig;
  private onLoadingChange?: LoadingCallback;
  private responseProcessorRegistry: ResponseProcessorRegistry;

  constructor(
    private primaryAI: IAIService,
    config: Partial<MCPClientConfig> = {},
  ) {
    this.config = {
      backendUrl: config.backendUrl || "http://localhost:3001",
      timeout: config.timeout || 10000, // 10 seconds
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000, // 1 second
    };

    this.responseProcessorRegistry = new ResponseProcessorRegistry(
      this.primaryAI,
    );
  }

  setLoadingCallback(callback: LoadingCallback): void {
    this.onLoadingChange = callback;
  }

  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    try {
      // Build enhanced tool prompt with better instructions
      const toolPrompt = this.buildToolPrompt();
      const fullPrompt = `${toolPrompt}\nUser: ${message}`;

      // Get initial AI response
      let aiResponse = await this.primaryAI.sendMessage(fullPrompt, history);

      // Check if AI requested a tool
      const toolRequest = this.parseToolRequest(aiResponse);

      if (toolRequest) {
        const { toolName, query } = toolRequest;

        // Set loading state
        this.onLoadingChange?.(true, toolName);

        try {
          // Call backend MCP endpoint
          const toolResult = await this.callBackendTool(toolName, query);

          // Process the tool result
          aiResponse = await this.processToolResult(
            toolName,
            toolResult,
            message,
            history,
          );
        } finally {
          // Clear loading state
          this.onLoadingChange?.(false);
        }
      }

      return aiResponse;
    } catch (error) {
      console.error("[MCPClient] Error in sendMessage:", error);
      const errorMessage = this.getErrorMessage(error);
      return `I encountered an error while processing your request: ${errorMessage}`;
    }
  }

  private async callBackendTool(
    toolName: string,
    query: string,
  ): Promise<ToolResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.config.timeout,
        );

        const response = await fetch(`${this.config.backendUrl}/mcp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tool: toolName, query }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(
            `Backend error: ${response.status} ${response.statusText}`,
          );
        }

        const result = (await response.json()) as ToolResult;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === this.config.maxRetries) {
          break;
        }

        await this.delay(this.config.retryDelay);
      }
    }

    throw this.enhanceError(lastError!);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private enhanceError(error: Error): Error {
    if (error.name === "AbortError") {
      return new Error(
        `Request timed out after ${this.config.timeout}ms. Please check if the backend server is running.`,
      );
    }

    if (error.message.includes("fetch")) {
      return new Error(
        "Unable to connect to backend service. Please check if the server is running.",
      );
    }

    if (error.message.includes("Backend error")) {
      return new Error(`Backend service error: ${error.message}`);
    }

    return error;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return "Unknown error occurred";
  }

  private buildToolPrompt(): string {
    return `You are an assistant with access to various tools.

AVAILABLE TOOLS:
- weather: Get current weather information for any location

IMPORTANT INSTRUCTIONS:
- When you need to use a tool, respond ONLY in this format: [TOOL: tool_name, query: your_query]
- For weather queries, extract ONLY the location name (e.g., "Israel", "New York", "London")
- Do NOT answer directly if a tool is available and needed
- If no tool is needed, answer normally without using the [TOOL:] format

Examples:
- "What's the weather in Paris?" → [TOOL: weather, query: Paris]
- "How are you?" → Normal response (no tool needed)
- "Tell me about the weather in Tokyo" → [TOOL: weather, query: Tokyo]`;
  }

  private parseToolRequest(
    response: string,
  ): { toolName: string; query: string } | null {
    const toolMatch = response.match(
      /\[TOOL:\s*([^,\]]+),\s*query:\s*([^\]]+)\]/i,
    );

    if (toolMatch) {
      return {
        toolName: toolMatch[1].trim(),
        query: toolMatch[2].trim(),
      };
    }

    return null;
  }

  private async processToolResult(
    toolName: string,
    toolResult: ToolResult,
    originalMessage: string,
    history: ChatMessage[],
  ): Promise<string> {
    if (!toolResult.success) {
      const errorMsg = toolResult.error || "Unknown tool error";
      return `I tried to use the ${toolName} tool but encountered an error: ${errorMsg}. Please try again or contact support if the issue persists.`;
    }

    // Delegate to appropriate response processor
    return this.responseProcessorRegistry.processToolResult(
      toolName,
      toolResult,
      originalMessage,
      history,
    );
  }

  getSystemMessage(): string {
    return "Client AI Service with enhanced tool integration";
  }

  validateApiKey(apiKey: string): boolean {
    return this.primaryAI.validateApiKey(apiKey);
  }

  getProviderName(): string {
    return "Client MCP AI Service";
  }
}
