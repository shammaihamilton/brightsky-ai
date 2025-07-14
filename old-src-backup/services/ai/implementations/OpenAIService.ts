import { OpenAI } from 'openai';
import { IAIService } from '../interfaces/IAIService';
import { AIProvider, ConversationTone } from '../enums/AIProvider';
import type {
  ChatMessage,
  AIResponse,
  AIRequestOptions,
} from '../interfaces/types';
import { config } from '../../../config/environment';

export class OpenAIService implements IAIService {
  private client: OpenAI;
  private readonly provider = AIProvider.OPENAI;

  constructor() {
    if (!config.ai.openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.client = new OpenAI({
      apiKey: config.ai.openai.apiKey,
    });
  }

  async sendMessage(
    message: string,
    history: ChatMessage[] = [],
    options: AIRequestOptions = {},
  ): Promise<AIResponse> {
    try {
      const { tone = ConversationTone.FRIENDLY, tools = [] } = options;

      // Convert chat history to OpenAI format
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: this.getSystemPrompt(tone, tools),
        },
        ...history.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: message,
        },
      ];

      // Prepare function definitions for tools
      const functions = this.prepareToolFunctions(tools);

      const completion = await this.client.chat.completions.create({
        model: config.ai.openai.model || 'gpt-3.5-turbo',
        messages,
        functions: functions.length > 0 ? functions : undefined,
        function_call: functions.length > 0 ? 'auto' : undefined,
        temperature: this.getToneTemperature(tone),
        max_tokens: config.ai.openai.maxTokens || 1000,
      });

      const choice = completion.choices[0];

      if (!choice) {
        throw new Error('No response from OpenAI');
      }

      // Handle function calls
      if (choice.message.function_call) {
        return await this.handleFunctionCall(
          choice.message.function_call,
          tools,
          message,
          history,
          options,
        );
      }

      return {
        success: true,
        content:
          choice.message.content ||
          "I apologize, but I couldn't generate a response.",
        provider: this.provider,
        metadata: {
          model: completion.model,
          usage: completion.usage,
          finishReason: choice.finish_reason,
        },
      };
    } catch (error) {
      console.error('[OpenAIService] Error:', error);

      return {
        success: false,
        content:
          'I apologize, but I encountered an error processing your request.',
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkHealth(): Promise<{ success: boolean; message: string }> {
    try {
      // Simple test to verify API key and connection
      await this.client.models.list();
      return {
        success: true,
        message: 'OpenAI service is healthy',
      };
    } catch (error) {
      return {
        success: false,
        message: `OpenAI service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private getSystemPrompt(
    tone: ConversationTone,
    availableTools: string[],
  ): string {
    const basePrompt = 'You are a helpful AI assistant.';

    const toneInstructions = {
      [ConversationTone.PROFESSIONAL]:
        'Please respond in a professional and formal manner.',
      [ConversationTone.FRIENDLY]:
        'Please respond in a friendly and conversational manner.',
      [ConversationTone.CASUAL]:
        'Please respond in a casual and relaxed manner.',
      [ConversationTone.CREATIVE]:
        'Please respond in a creative and imaginative manner.',
      [ConversationTone.ANALYTICAL]:
        'Please respond in an analytical and precise manner.',
    };

    let prompt = `${basePrompt} ${toneInstructions[tone]}`;

    if (availableTools.length > 0) {
      prompt += ` You have access to the following tools: ${availableTools.join(', ')}. Use them when appropriate to help answer user questions.`;
    }

    return prompt;
  }

  private getToneTemperature(tone: ConversationTone): number {
    switch (tone) {
      case ConversationTone.PROFESSIONAL:
        return 0.3;
      case ConversationTone.FRIENDLY:
        return 0.7;
      case ConversationTone.CASUAL:
        return 0.8;
      case ConversationTone.CREATIVE:
        return 0.9;
      case ConversationTone.ANALYTICAL:
        return 0.1;
      default:
        return 0.7;
    }
  }

  private prepareToolFunctions(
    tools: string[],
  ): OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] {
    const functions: OpenAI.Chat.Completions.ChatCompletionCreateParams.Function[] =
      [];

    if (tools.includes('weather')) {
      functions.push({
        name: 'get_weather',
        description: 'Get current weather information for a specific location',
        parameters: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'The city and country, e.g. London, UK',
            },
          },
          required: ['location'],
        },
      });
    }

    if (tools.includes('database')) {
      functions.push({
        name: 'query_database',
        description: 'Query the database for information',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language description of what to search for',
            },
          },
          required: ['query'],
        },
      });
    }

    return functions;
  }

  private async handleFunctionCall(
    functionCall: OpenAI.Chat.Completions.ChatCompletionMessage.FunctionCall,
    tools: string[],
    originalMessage: string,
    history: ChatMessage[],
    options: AIRequestOptions,
  ): Promise<AIResponse> {
    try {
      const { name, arguments: args } = functionCall;
      const parsedArgs = JSON.parse(args || '{}');

      // This would typically call the actual tool through MCP
      // For now, return a simulated response
      let toolResult = '';

      switch (name) {
        case 'get_weather':
          toolResult = `Weather in ${parsedArgs.location}: Sunny, 22°C (simulated response)`;
          break;
        case 'query_database':
          toolResult = `Database query "${parsedArgs.query}" returned simulated results.`;
          break;
        default:
          toolResult = `Tool "${name}" executed with simulated response.`;
      }

      // Create a follow-up completion with the tool result
      const followUpMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
        [
          {
            role: 'system',
            content: this.getSystemPrompt(
              options.tone || ConversationTone.FRIENDLY,
              tools,
            ),
          },
          ...history.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: originalMessage,
          },
          {
            role: 'assistant',
            content: null,
            function_call: functionCall,
          },
          {
            role: 'function',
            name,
            content: toolResult,
          },
        ];

      const completion = await this.client.chat.completions.create({
        model: config.ai.openai.model || 'gpt-3.5-turbo',
        messages: followUpMessages,
        temperature: this.getToneTemperature(
          options.tone || ConversationTone.FRIENDLY,
        ),
        max_tokens: config.ai.openai.maxTokens || 1000,
      });

      const choice = completion.choices[0];

      return {
        success: true,
        content: choice?.message?.content || 'Tool executed successfully.',
        provider: this.provider,
        metadata: {
          model: completion.model,
          usage: completion.usage,
          finishReason: choice?.finish_reason,
          toolUsed: name,
          toolResult,
        },
      };
    } catch (error) {
      console.error('[OpenAIService] Function call error:', error);

      return {
        success: false,
        content: 'I encountered an error while using the requested tool.',
        provider: this.provider,
        error: error instanceof Error ? error.message : 'Tool execution failed',
      };
    }
  }
}
