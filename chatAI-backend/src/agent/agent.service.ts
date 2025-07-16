import { Injectable, Logger } from '@nestjs/common';
import { ToolOrchestrationService } from '../mcp/mcp.service';
import { SessionData } from '../session/session.service';
import { AIService } from '../services/ai.service';

export interface AgentResponse {
  content: string;
  metadata?: Record<string, any>;
  updatedContext?: Record<string, any>;
  toolsUsed?: string[];
}

export interface IntentRecognition {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export interface ToolSelection {
  toolName: string;
  confidence: number;
  params: Record<string, any>;
}

export interface ToolResult {
  toolName: string;
  result: unknown;
  error?: string;
  confidence: number;
}

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly toolOrchestrationService: ToolOrchestrationService,
    private readonly aiService: AIService,
  ) {}

  async processMessage(
    content: string,
    conversationHistory: SessionData['conversationHistory'],
    context: Record<string, any>,
    _metadata?: Record<string, any>,
  ): Promise<AgentResponse> {
    try {
      // 1. Intent recognition
      const intents = this.recognizeIntents(content, conversationHistory);
      this.logger.debug('Recognized intents:', intents);

      // 2. Tool selection
      const toolPlan = this.selectTools(intents, context);
      this.logger.debug('Selected tools:', toolPlan);

      // 3. Execute tools if needed
      let toolResults: ToolResult[] = [];
      if (toolPlan.length > 0) {
        toolResults = await this.executeToolPlan(toolPlan, context);
      }

      // 4. Generate response
      const response = await this.synthesizeResponse(
        content,
        intents,
        toolResults,
        conversationHistory,
        context,
      );

      return response;
    } catch (error) {
      this.logger.error('Error processing message:', error);
      throw error;
    }
  }

  private recognizeIntents(
    content: string,
    _conversationHistory: SessionData['conversationHistory'],
  ): IntentRecognition[] {
    const intents: IntentRecognition[] = [];

    // Simple intent recognition - in production, use NLU service
    const lowerContent = content.toLowerCase();

    // Weather intent
    if (
      lowerContent.includes('weather') ||
      lowerContent.includes('temperature') ||
      lowerContent.includes('forecast')
    ) {
      intents.push({
        intent: 'weather_query',
        confidence: 0.8,
        entities: this.extractLocationEntities(content),
      });
    }

    // Calendar intent
    if (
      lowerContent.includes('calendar') ||
      lowerContent.includes('schedule') ||
      lowerContent.includes('meeting')
    ) {
      intents.push({
        intent: 'calendar_query',
        confidence: 0.7,
        entities: this.extractDateEntities(content),
      });
    }

    // General conversation
    if (intents.length === 0) {
      intents.push({
        intent: 'general_conversation',
        confidence: 0.6,
        entities: {},
      });
    }

    return intents;
  }

  private selectTools(
    intents: IntentRecognition[],
    _context: Record<string, any>,
  ): ToolSelection[] {
    const toolPlan: ToolSelection[] = [];

    for (const intent of intents) {
      switch (intent.intent) {
        case 'weather_query':
          toolPlan.push({
            toolName: 'weather',
            confidence: intent.confidence,
            params: {
              location:
                (intent.entities.location as string) || 'current location',
            },
          });
          break;

        case 'calendar_query':
          toolPlan.push({
            toolName: 'calendar',
            confidence: intent.confidence,
            params: {
              startDate: (intent.entities.startDate as Date) || new Date(),
              endDate:
                (intent.entities.endDate as Date) ||
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
          break;

        // Add more tool mappings as needed
      }
    }

    return toolPlan.sort((a, b) => b.confidence - a.confidence);
  }

  private async executeToolPlan(
    toolPlan: ToolSelection[],
    _context: Record<string, any>,
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const tool of toolPlan) {
      try {
        this.logger.log(`Executing tool: ${tool.toolName}`);

        const result = await this.toolOrchestrationService.callTool(
          tool.toolName,
          tool.params,
        );

        this.logger.log(`Tool execution result for ${tool.toolName}:`, result);

        results.push({
          toolName: tool.toolName,
          result: result.result, // Extract the actual result from the response
          confidence: tool.confidence,
        });
      } catch (error) {
        this.logger.error(`Error executing tool ${tool.toolName}:`, error);
        results.push({
          toolName: tool.toolName,
          result: null,
          error: error instanceof Error ? error.message : 'Unknown error',
          confidence: tool.confidence,
        });
      }
    }

    return results;
  }

  private async synthesizeResponse(
    originalMessage: string,
    intents: IntentRecognition[],
    toolResults: ToolResult[],
    conversationHistory: SessionData['conversationHistory'],
    _context: Record<string, any>,
  ): Promise<AgentResponse> {
    const toolsUsed: string[] = [];
    let content = '';

    // If we have tool results, use AI to process them
    if (toolResults.length > 0) {
      for (const result of toolResults) {
        toolsUsed.push(result.toolName);

        this.logger.log(
          `Processing tool result for ${result.toolName}:`,
          result,
        );

        if (result.error) {
          content += `I encountered an error with the ${result.toolName} tool: ${result.error}\n`;
        }
      }

      // Use AI service to process the tool results and generate a natural response
      try {
        const aiResult = await this.aiService.processWithContext(
          originalMessage,
          toolResults,
          conversationHistory,
          {
            temperature: 0.7,
            maxTokens: 500,
          },
        );

        content = aiResult.response;
        this.logger.log('AI processed response:', {
          originalMessage,
          toolsUsed,
          responseLength: content.length,
        });
      } catch (error) {
        this.logger.error('Error processing with AI:', error);
        content =
          'I apologize, but I encountered an error while processing your request. Please try again.';
      }
    } else {
      // General conversation response - still use AI for consistency
      try {
        const aiResult = await this.aiService.processWithContext(
          originalMessage,
          [],
          conversationHistory,
          {
            temperature: 0.8,
            maxTokens: 300,
          },
        );
        content = aiResult.response;
      } catch (error) {
        this.logger.error('Error processing general conversation:', error);
        content = this.generateGeneralResponse(
          originalMessage,
          conversationHistory,
        );
      }
    }

    return {
      content: content.trim(),
      metadata: {
        intents,
        toolsUsed,
        timestamp: new Date(),
      },
      toolsUsed,
    };
  }

  private extractLocationEntities(content: string): Record<string, any> {
    // Simple location extraction - in production, use NER
    const locationMatch = content.match(/in\s+([a-zA-Z\s]+)/i);
    return {
      location: locationMatch ? locationMatch[1].trim() : null,
    };
  }

  private extractDateEntities(content: string): Record<string, any> {
    // Simple date extraction - in production, use NER
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (content.includes('tomorrow')) {
      return { startDate: tomorrow };
    }

    if (content.includes('today')) {
      return { startDate: today };
    }

    return {};
  }

  private generateGeneralResponse(
    message: string,
    _conversationHistory: SessionData['conversationHistory'],
  ): string {
    // Simple response generation - in production, use LLM
    const responses = [
      "I understand you're saying: " + message,
      "That's interesting. Could you tell me more?",
      'I see. How can I help you with that?',
      'Thanks for sharing that with me.',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }
}
