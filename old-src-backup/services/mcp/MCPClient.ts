import { AIServiceRouter } from '../ai/router/AIServiceRouter';
import { AIProvider, ConversationTone } from '../ai/enums/AIProvider';
import { ToolRegistry } from './tools/ToolRegistry';
import { WeatherTool } from './tools/WeatherTool';
import { DatabaseTool } from './tools/DatabaseTool';
import { config } from '../../config/environment';
import type { ChatMessage, AIServiceConfig } from '../ai/interfaces/types';

interface MCPClientConfig {
  provider: AIProvider;
  tone?: ConversationTone;
}

export class MCPClient {
  private aiRouter: AIServiceRouter;
  private toolRegistry: ToolRegistry;
  private config: MCPClientConfig;

  constructor(config: MCPClientConfig) {
    this.config = config;
    this.aiRouter = new AIServiceRouter();
    this.toolRegistry = new ToolRegistry();
    this.initializeAllTools();
  }

  private initializeAllTools(): void {
    // Initialize tools based on environment config with validation
    const toolsInitialized: string[] = [];

    if (config.features.weatherEnabled) {
      try {
        this.toolRegistry.register(new WeatherTool());
        toolsInitialized.push('weather');
      } catch (error) {
        console.warn('[MCPClient] Failed to initialize WeatherTool:', error);
      }
    }

    if (config.features.databaseEnabled) {
      try {
        this.toolRegistry.register(new DatabaseTool());
        toolsInitialized.push('database');
      } catch (error) {
        console.warn('[MCPClient] Failed to initialize DatabaseTool:', error);
      }
    }

    console.log(
      `[MCPClient] Successfully initialized tools: ${toolsInitialized.join(', ')}`,
    );
  }

  async sendMessage(
    message: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    try {
      const aiConfig = this.getAIConfig();
      const availableTools = this.toolRegistry
        .getAvailableTools()
        .map((tool) => tool.name);

      const aiResponse = await this.aiRouter.sendMessage(
        aiConfig,
        message,
        history,
        {
          tone: this.config.tone || ConversationTone.FRIENDLY,
          tools: availableTools,
        },
      );

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'AI service error');
      }

      return aiResponse.content;
    } catch (error) {
      console.error('[MCPClient] Error:', error);
      throw error;
    }
  }

  private getAIConfig(): AIServiceConfig {
    return {
      provider: this.config.provider,
      apiKey: this.getApiKey(),
      maxTokens: 1000,
      temperature: 0.7,
      tone: this.config.tone || ConversationTone.FRIENDLY,
    };
  }

  private getApiKey(): string {
    switch (this.config.provider) {
      case AIProvider.OPENAI:
        return config.ai.openai.apiKey;
      case AIProvider.CLAUDE:
        return config.ai.claude.apiKey;
      case AIProvider.GEMINI:
        return config.ai.gemini.apiKey;
      default:
        throw new Error(
          `No API key configured for provider: ${String(this.config.provider)}`,
        );
    }
  }
}
