import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AIServiceRouter } from '../services/ai/router/AIServiceRouter';
import { DatabaseService } from '../services/database/DatabaseService';
import { AIProvider, ConversationTone } from '../services/ai/enums/AIProvider';
import { config } from '../config/environment';
import type {
  ChatMessage,
  AIServiceConfig,
} from '../services/ai/interfaces/types';

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  provider: string;
  directDbAccess?: boolean;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  metadata?: {
    processingTime: number;
    mode: string;
    availableTools?: string[];
  };
}

@Controller('api/chat')
export class ChatController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post()
  async handleChatMessage(@Body() body: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, history, provider, directDbAccess = false } = body;

      // Validate input
      if (!message || typeof message !== 'string') {
        throw new HttpException(
          'Message is required and must be a string',
          HttpStatus.BAD_REQUEST,
        );
      }

      let response: string;
      const startTime = Date.now();

      if (directDbAccess) {
        response = await this.handleDirectDbAccess(message, history);
      } else {
        response = await this.handleAIAssistant(message, history, provider);
      }

      const processingTime = Date.now() - startTime;
      const availableTools = this.getAvailableTools();

      return {
        success: true,
        response,
        metadata: {
          processingTime,
          mode: directDbAccess ? 'database_direct' : 'ai_assistant',
          availableTools,
        },
      };
    } catch (error) {
      console.error('[ChatController] Error handling chat message:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        error instanceof Error ? error.message : 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  async healthCheck(): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    version: string;
    availableTools: string[];
  }> {
    const availableTools = this.getAvailableTools();

    return {
      success: true,
      message: 'Chat service is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      availableTools,
    };
  }

  private async handleAIAssistant(
    message: string,
    history: ChatMessage[],
    provider: string,
  ): Promise<string> {
    if (!Object.values(AIProvider).includes(provider as AIProvider)) {
      throw new HttpException(
        `Invalid AI provider: ${provider}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create AI service config
    const aiConfig: AIServiceConfig = {
      provider: provider as AIProvider,
      apiKey: this.getApiKey(provider as AIProvider),
      maxTokens: 1000,
      temperature: 0.7,
      tone: ConversationTone.FRIENDLY,
    };

    // Create AI service router and send message
    const aiRouter = new AIServiceRouter();
    const availableTools = this.getAvailableTools();

    const aiResponse = await aiRouter.sendMessage(aiConfig, message, history, {
      tone: ConversationTone.FRIENDLY,
      tools: availableTools,
    });

    if (!aiResponse.success) {
      throw new HttpException(
        aiResponse.error || 'AI service error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return aiResponse.content;
  }

  private async handleDirectDbAccess(
    message: string,
    history: ChatMessage[],
  ): Promise<string> {
    try {
      const dbResult =
        await this.databaseService.queryWithNaturalLanguage(message);

      if (!dbResult.success) {
        return `I couldn't access the database: ${dbResult.error}`;
      }

      return this.formatDatabaseResult(dbResult.data, message);
    } catch (error) {
      console.error('[ChatController] Database access error:', error);
      return 'I encountered an error while accessing the database. Please try again.';
    }
  }

  private getAvailableTools(): string[] {
    const tools: string[] = [];

    if (config.features.weatherEnabled) tools.push('weather');
    if (config.features.databaseEnabled) tools.push('database');
    if (config.features.webSearchEnabled) tools.push('web_search');

    return tools;
  }

  private formatDatabaseResult(data: any, originalQuery: string): string {
    if (!data || Object.keys(data).length === 0) {
      return "I couldn't find any relevant information in the database for your query.";
    }

    if (Array.isArray(data)) {
      if (data.length === 0) {
        return 'Your query returned no results.';
      }

      return `I found ${data.length} result(s):\n${data
        .map((item, index) => `${index + 1}. ${JSON.stringify(item)}`)
        .join('\n')}`;
    }

    if (typeof data === 'object') {
      const entries = Object.entries(data);
      return `Here's what I found:\n${entries
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}`;
    }

    return `Query result: ${String(data)}`;
  }

  private getApiKey(provider: AIProvider): string {
    switch (provider) {
      case AIProvider.OPENAI:
        return config.ai.openai.apiKey;
      case AIProvider.CLAUDE:
        return config.ai.claude.apiKey;
      case AIProvider.GEMINI:
        return config.ai.gemini.apiKey;
      default:
        throw new Error(
          `No API key configured for provider: ${String(provider)}`,
        );
    }
  }
}
