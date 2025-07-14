import { Injectable, Logger } from '@nestjs/common';
import { AIServiceRouter } from '../services/ai/router/AIServiceRouter';
import { ToolRegistry } from '../tools/registry/ToolRegistry';
import { AIProvider, ConversationTone } from '../services/ai/enums/AIProvider';
import type {
  AIServiceConfig,
  ChatMessage,
} from '../services/ai/interfaces/types';

export interface AgentResponse {
  success: boolean;
  message: string;
  toolsUsed?: string[];
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly aiRouter: AIServiceRouter,
    private readonly toolRegistry: ToolRegistry,
  ) {}

  async processMessage(
    message: string,
    history: ChatMessage[] = [],
    provider: string = 'openai',
  ): Promise<AgentResponse> {
    try {
      this.logger.log(`Processing message: ${message}`);

      // Step 1: Analyze if tools are needed
      const toolAnalysis = await this.analyzeForTools(message);

      // Step 2: Execute tools if needed
      const toolResults = await this.executeTools(
        toolAnalysis.suggestedTools,
        message,
      );

      // Step 3: Send to AI with tool results as context
      const aiResponse = await this.sendToAI(
        message,
        history,
        toolResults,
        provider,
      );

      return {
        success: true,
        message:
          aiResponse.content || aiResponse.message || 'No response from AI',
        toolsUsed: toolAnalysis.suggestedTools,
        metadata: {
          toolResults,
          aiMetadata: aiResponse.metadata,
        },
      };
    } catch (error) {
      this.logger.error(`Error processing message: ${error.message}`);
      return {
        success: false,
        message: 'I encountered an error processing your request.',
        toolsUsed: [],
      };
    }
  }

  async getAvailableTools(): Promise<
    Array<{
      name: string;
      description: string;
      aliases: string[];
    }>
  > {
    try {
      return this.toolRegistry.getAvailableTools();
    } catch (error) {
      this.logger.error(`Error getting available tools: ${error.message}`);
      return [];
    }
  }

  private async analyzeForTools(message: string): Promise<{
    suggestedTools: string[];
    confidence: number;
  }> {
    const availableTools = this.toolRegistry.getAvailableTools();
    const suggestedTools: string[] = [];

    for (const tool of availableTools) {
      const canHandle = await this.toolRegistry.canToolHandle(
        tool.name,
        message,
      );
      if (canHandle) {
        suggestedTools.push(tool.name);
      }
    }

    return {
      suggestedTools,
      confidence: suggestedTools.length > 0 ? 0.8 : 0.2,
    };
  }

  private async executeTools(
    toolNames: string[],
    message: string,
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    for (const toolName of toolNames) {
      try {
        const result = await this.toolRegistry.executeTool(toolName, message);
        results[toolName] = result;
      } catch (error) {
        this.logger.error(`Tool ${toolName} failed: ${error.message}`);
        results[toolName] = { success: false, error: error.message };
      }
    }

    return results;
  }

  private async sendToAI(
    message: string,
    history: ChatMessage[],
    toolResults: Record<string, unknown>,
    provider: string,
  ): Promise<any> {
    const config: AIServiceConfig = {
      provider: provider === 'openai' ? AIProvider.OPENAI : AIProvider.OPENAI,
      apiKey: process.env.OPENAI_API_KEY || '',
      maxTokens: 1000,
      temperature: 0.7,
      tone: ConversationTone.FRIENDLY,
    };

    const systemMessage = this.buildSystemMessage(toolResults);
    const enhancedHistory = [
      { role: 'system' as const, content: systemMessage },
      ...history,
    ];

    return await this.aiRouter.sendMessage(config, message, enhancedHistory);
  }

  private buildSystemMessage(toolResults: Record<string, unknown>): string {
    let systemMessage =
      'You are a helpful AI assistant with access to real-time tools.';

    if (Object.keys(toolResults).length > 0) {
      systemMessage += '\n\nTool Results:\n';
      for (const [toolName, result] of Object.entries(toolResults)) {
        systemMessage += `${toolName}: ${JSON.stringify(result)}\n`;
      }
      systemMessage += '\nUse this information to provide a helpful response.';
    }

    return systemMessage;
  }
}
