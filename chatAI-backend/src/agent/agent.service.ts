import { Injectable, Logger } from '@nestjs/common';
import { ToolOrchestrationService } from '../mcp/mcp.service';
import { SessionData } from '../session/session.service';

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

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    private readonly toolOrchestrationService: ToolOrchestrationService,
  ) {}

  async processMessage(
    content: string,
    conversationHistory: SessionData['conversationHistory'],
    context: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<AgentResponse> {
    try {
      // 1. Intent recognition
      const intents = await this.recognizeIntents(content, conversationHistory);
      this.logger.debug('Recognized intents:', intents);

      // 2. Tool selection
      const toolPlan = await this.selectTools(intents, context);
      this.logger.debug('Selected tools:', toolPlan);

      // 3. Execute tools if needed
      let toolResults: any[] = [];
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

  private async recognizeIntents(
    content: string,
    conversationHistory: SessionData['conversationHistory'],
  ): Promise<IntentRecognition[]> {
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

  private async selectTools(
    intents: IntentRecognition[],
    context: Record<string, any>,
  ): Promise<ToolSelection[]> {
    const toolPlan: ToolSelection[] = [];

    for (const intent of intents) {
      switch (intent.intent) {
        case 'weather_query':
          toolPlan.push({
            toolName: 'weather',
            confidence: intent.confidence,
            params: {
              location: intent.entities.location || 'current location',
            },
          });
          break;

        case 'calendar_query':
          toolPlan.push({
            toolName: 'calendar',
            confidence: intent.confidence,
            params: {
              startDate: intent.entities.startDate || new Date(),
              endDate:
                intent.entities.endDate ||
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
    context: Record<string, any>,
  ): Promise<any[]> {
    const results: any[] = [];

    for (const tool of toolPlan) {
      try {
        this.logger.log(`Executing tool: ${tool.toolName}`);

        const result = await this.toolOrchestrationService.callTool(
          tool.toolName,
          tool.params,
        );
        results.push({
          toolName: tool.toolName,
          result,
          confidence: tool.confidence,
        });
      } catch (error) {
        this.logger.error(`Error executing tool ${tool.toolName}:`, error);
        results.push({
          toolName: tool.toolName,
          error: error.message,
          confidence: tool.confidence,
        });
      }
    }

    return results;
  }

  private async synthesizeResponse(
    originalMessage: string,
    intents: IntentRecognition[],
    toolResults: any[],
    conversationHistory: SessionData['conversationHistory'],
    context: Record<string, any>,
  ): Promise<AgentResponse> {
    // Simple response synthesis - in production, use LLM
    let content = '';
    const toolsUsed: string[] = [];

    if (toolResults.length > 0) {
      for (const result of toolResults) {
        toolsUsed.push(result.toolName);

        if (result.error) {
          content += `I encountered an error with the ${result.toolName} tool: ${result.error}\n`;
        } else {
          switch (result.toolName) {
            case 'weather':
              content += this.formatWeatherResponse(result.result);
              break;
            case 'calendar':
              content += this.formatCalendarResponse(result.result);
              break;
            default:
              content += `${result.toolName} result: ${JSON.stringify(result.result)}\n`;
          }
        }
      }
    } else {
      // General conversation response
      content = this.generateGeneralResponse(
        originalMessage,
        conversationHistory,
      );
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

  private formatWeatherResponse(weatherData: any): string {
    if (!weatherData) return 'Weather information is not available.\n';

    return (
      `Current weather: ${weatherData.temperature}°C, ${weatherData.description}. ` +
      `Humidity: ${weatherData.humidity}%.\n`
    );
  }

  private formatCalendarResponse(calendarData: any): string {
    if (
      !calendarData ||
      !calendarData.events ||
      calendarData.events.length === 0
    ) {
      return 'No calendar events found.\n';
    }

    let response = 'Here are your upcoming events:\n';
    for (const event of calendarData.events.slice(0, 5)) {
      response += `• ${event.summary} at ${event.start.dateTime || event.start.date}\n`;
    }

    return response;
  }

  private generateGeneralResponse(
    message: string,
    conversationHistory: SessionData['conversationHistory'],
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
