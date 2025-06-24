// AI Service for Chrome Extension - Direct API calls to various providers
import { ApiKeySecurity } from '../utils/apiKeySecurity';

export interface AIServiceConfig {
  provider: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  messageId: string;
  chunk: string;
  isFinal: boolean;
}

export class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = {
      ...config,
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
    };
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    const { provider } = this.config;
    
    try {
      const deobfuscatedApiKey = ApiKeySecurity.deobfuscate(this.config.apiKey);
      
      if (!deobfuscatedApiKey) {
        throw new Error('Invalid API key');
      }

      switch (provider) {
        case 'openai':
          return await this.sendOpenAIMessage(deobfuscatedApiKey, message, conversationHistory, onChunk);
        case 'claude':
          return await this.sendClaudeMessage(deobfuscatedApiKey, message, conversationHistory, onChunk);
        case 'gemini':
          return await this.sendGeminiMessage(deobfuscatedApiKey, message, conversationHistory, onChunk);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  private async sendOpenAIMessage(
    apiKey: string,
    message: string,
    conversationHistory: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: 'user',
        content: message,
      },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: !!onChunk,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use the generic error message
      }
      
      throw new Error(errorMessage);
    }

    if (onChunk && response.body) {
      return await this.handleOpenAIStream(response, onChunk);
    } else {
      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    }
  }

  private async handleOpenAIStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    const messageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onChunk({ messageId, chunk: '', isFinal: true });
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onChunk({ messageId, chunk: '', isFinal: true });
              return fullResponse;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                onChunk({ messageId, chunk: content, isFinal: false });
              }
            } catch (parseError) {
              console.warn('Failed to parse OpenAI stream chunk:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }

  private async sendClaudeMessage(
    apiKey: string,
    message: string,
    conversationHistory: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    const messages = conversationHistory
      .slice(-10)
      .filter(msg => msg.role !== 'system')
      .concat([{ role: 'user', content: message }]);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: Math.min(this.config.maxTokens!, 4096),
        messages,
        system: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
        stream: !!onChunk,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Claude API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use the generic error message
      }
      
      throw new Error(errorMessage);
    }

    if (onChunk && response.body) {
      return await this.handleClaudeStream(response, onChunk);
    } else {
      const data = await response.json();
      return data.content[0]?.text || 'No response received';
    }
  }

  private async handleClaudeStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    const messageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onChunk({ messageId, chunk: '', isFinal: true });
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onChunk({ messageId, chunk: '', isFinal: true });
              return fullResponse;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                const content = parsed.delta.text;
                fullResponse += content;
                onChunk({ messageId, chunk: content, isFinal: false });
              }
            } catch (parseError) {
              console.warn('Failed to parse Claude stream chunk:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }

  private async sendGeminiMessage(
    apiKey: string,
    message: string,
    conversationHistory: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    const contents = [
      ...conversationHistory
        .slice(-10)
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    const streamParam = onChunk ? '?alt=sse' : '';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent${streamParam}&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: this.config.maxTokens,
            temperature: this.config.temperature,
          },
          systemInstruction: {
            parts: [{ text: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.' }],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Gemini API Error: ${response.status} ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {
        // Use the generic error message
      }
      
      throw new Error(errorMessage);
    }

    if (onChunk && response.body) {
      return await this.handleGeminiStream(response, onChunk);
    } else {
      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'No response received';
    }
  }

  private async handleGeminiStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    const messageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onChunk({ messageId, chunk: '', isFinal: true });
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              
              if (content) {
                fullResponse += content;
                onChunk({ messageId, chunk: content, isFinal: false });
              }
            } catch (parseError) {
              console.warn('Failed to parse Gemini stream chunk:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }
}
