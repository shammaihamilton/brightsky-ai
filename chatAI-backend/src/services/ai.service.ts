import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AIProcessingOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIProcessingResult {
  response: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ToolResult {
  toolName: string;
  result: unknown;
  error?: string;
}

interface WeatherData {
  location?: string;
  temperature?: number;
  description?: string;
  humidity?: number;
  wind?: {
    speed?: number;
    direction?: string;
  };
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async processWithContext(
    userMessage: string,
    toolResults: ToolResult[],
    conversationHistory: SessionMessage[] = [],
    options: AIProcessingOptions = {},
  ): Promise<AIProcessingResult> {
    try {
      const {
        temperature = 0.7,
        maxTokens = 500,
        model = 'gpt-3.5-turbo',
      } = options;

      // Build context from tool results
      const toolContext = this.buildToolContext(toolResults);

      // Create system prompt
      const systemPrompt = this.createSystemPrompt(toolContext);

      // Prepare conversation history
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      this.logger.log('Sending request to OpenAI with context');
      this.logger.log('Tool context being sent:', toolContext);
      this.logger.log('System prompt:', systemPrompt);

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const response =
        completion.choices[0]?.message?.content ||
        "I apologize, but I couldn't generate a response.";

      return {
        response,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      this.logger.error('Error processing AI request:', error);
      throw new Error('Failed to process AI request');
    }
  }

  private buildToolContext(toolResults: ToolResult[]): string {
    if (!toolResults || toolResults.length === 0) {
      return '';
    }

    let context =
      'I have executed the following tools and received these results:\n\n';

    for (const result of toolResults) {
      context += `**${result.toolName.toUpperCase()} TOOL RESULT:**\n`;

      if (result.error) {
        context += `Error: ${result.error}\n\n`;
      } else {
        switch (result.toolName) {
          case 'weather':
            context += this.formatWeatherContext(result.result as WeatherData);
            break;
          case 'calendar':
            context += this.formatCalendarContext(result.result);
            break;
          default:
            context += `${JSON.stringify(result.result, null, 2)}\n\n`;
        }
      }
    }

    return context;
  }

  private formatWeatherContext(weatherData: WeatherData): string {
    if (!weatherData) return 'No weather data available\n\n';

    return `Location: ${weatherData.location || 'Unknown'}
Temperature: ${weatherData.temperature || 'Unknown'}°C
Conditions: ${weatherData.description || 'Unknown'}
Humidity: ${weatherData.humidity || 'Unknown'}%
Wind: ${weatherData.wind?.speed || 'Unknown'} km/h from ${
      weatherData.wind?.direction || 'Unknown'
    }

`;
  }

  private formatCalendarContext(calendarData: any): string {
    if (!calendarData) return 'No calendar data available\n\n';

    return `Calendar data: ${JSON.stringify(calendarData, null, 2)}\n\n`;
  }

  private createSystemPrompt(toolContext: string): string {
    return `You are a helpful AI assistant. Your role is to process and understand data from various tools and provide natural, conversational responses to users.

${toolContext ? `TOOL CONTEXT:\n${toolContext}` : ''}

INSTRUCTIONS:
1. Use the tool context above to provide accurate, helpful responses
2. If weather data is provided, describe the conditions naturally and offer relevant suggestions
3. Be conversational and engaging in your responses
4. If you don't have enough information, ask clarifying questions
5. Focus on being helpful and informative while maintaining a friendly tone

Remember: You are processing real data from tools, so provide accurate information based on the context provided.`;
  }
}
