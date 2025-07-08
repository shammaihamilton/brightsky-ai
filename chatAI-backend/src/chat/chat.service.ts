// clarity-backend/src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

export interface ChatOptions {
  useMock?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export enum RequestType {
  DATA_REQUEST = 'data_request',
  GENERAL_REQUEST = 'general_request',
}

// Add interface for type safety
interface ClassificationResponse {
  type: 'data_request' | 'general_request';
  confidence: number;
  extractedEntities: string[];
  suggestedTables: string[];
}

export interface ClassifiedRequest {
  type: RequestType;
  confidence: number;
  extractedEntities?: string[];
  suggestedTables?: string[];
}

// Add proper error type
interface DatabaseError {
  message: string;
  code?: string;
  errno?: number;
}

@Injectable()
export class ChatService {
  private openai: OpenAI;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Classify if the prompt is asking for data or general conversation
   */
  private async classifyRequest(prompt: string): Promise<ClassifiedRequest> {
    const classificationPrompt = `
Analyze this user request and determine if it's asking for data from a database or if it's a general question.

User request: "${prompt}"

Database schema context:
- users table: id, username, email, full_name, created_at, status

Respond with JSON only:
{
  "type": "data_request" | "general_request",
  "confidence": 0.0-1.0,
  "extractedEntities": ["entity1", "entity2"],
  "suggestedTables": ["table1", "table2"]
}

Examples:
- "Show me all users" -> data_request
- "How many orders were made today?" -> data_request  
- "What's the weather like?" -> general_request
- "Hello, how are you?" -> general_request
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: classificationPrompt }],
        temperature: 0.1,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content || '{}';

      // Type-safe JSON parsing
      let parsed: ClassificationResponse;
      try {
        const rawParsed = JSON.parse(content.trim()) as unknown;

        // Validate the structure
        if (this.isValidClassificationResponse(rawParsed)) {
          parsed = rawParsed;
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return this.fallbackClassification(prompt);
      }

      return {
        type:
          parsed.type === 'data_request'
            ? RequestType.DATA_REQUEST
            : RequestType.GENERAL_REQUEST,
        confidence: parsed.confidence,
        extractedEntities: parsed.extractedEntities,
        suggestedTables: parsed.suggestedTables,
      };
    } catch (error) {
      console.error('Classification error:', error);
      // Fallback to keyword-based classification
      return this.fallbackClassification(prompt);
    }
  }

  /**
   * Type guard to validate classification response
   */
  private isValidClassificationResponse(
    obj: unknown,
  ): obj is ClassificationResponse {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'type' in obj &&
      'confidence' in obj &&
      typeof (obj as Record<string, unknown>).type === 'string' &&
      typeof (obj as Record<string, unknown>).confidence === 'number' &&
      ['data_request', 'general_request'].includes(
        (obj as Record<string, unknown>).type as string,
      )
    );
  }

  /**
   * Fallback classification using simple keyword matching
   */
  private fallbackClassification(prompt: string): ClassifiedRequest {
    const dataKeywords = [
      'show',
      'list',
      'get',
      'find',
      'search',
      'count',
      'how many',
      'users',
      'orders',
      'products',
      'data',
      'table',
      'database',
      'select',
      'where',
      'all',
      'total',
      'sum',
      'average',
    ];

    const lowerPrompt = prompt.toLowerCase();
    const matchCount = dataKeywords.filter((keyword) =>
      lowerPrompt.includes(keyword),
    ).length;

    const isDataRequest = matchCount >= 2;

    return {
      type: isDataRequest
        ? RequestType.DATA_REQUEST
        : RequestType.GENERAL_REQUEST,
      confidence: isDataRequest ? 0.7 : 0.8,
      extractedEntities: [],
      suggestedTables: [],
    };
  }

  /**
   * Generate SQL query from natural language
   */
  private async generateSQLQuery(
    prompt: string,
    classification: ClassifiedRequest,
  ): Promise<string> {
    const sqlPrompt = `
Convert this natural language request to a SQL query.

Database Schema:
- users: id, username, email, full_name, created_at, status

User request: "${prompt}"
Suggested tables: ${classification.suggestedTables?.join(', ') || 'None'}

Rules:
1. Generate safe, read-only SELECT queries only
2. Use proper JOINs when needed
3. Include LIMIT clauses for large datasets
4. Use parameterized queries to prevent SQL injection
5. Return only the SQL query, no explanations

SQL Query:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: sqlPrompt }],
        temperature: 0.1,
        max_tokens: 300,
      });

      let sqlQuery = response.choices[0]?.message?.content?.trim() || '';

      // Clean up the response (remove markdown, extra text)
      sqlQuery = sqlQuery
        .replace(/```sql\n?/g, '')
        .replace(/```/g, '')
        .trim();

      return sqlQuery;
    } catch (error) {
      console.error('SQL generation error:', error);
      throw new Error('Failed to generate SQL query');
    }
  }

  /**
   * Analyze data and provide insights
   */
  private async analyzeData(
    originalPrompt: string,
    data: Record<string, unknown>[],
    sqlQuery: string,
  ): Promise<string> {
    const analysisPrompt = `
Original user request: "${originalPrompt}"
SQL query used: ${sqlQuery}
Retrieved data: ${JSON.stringify(data, null, 2)}

Please analyze this data and provide a helpful response to the user's original request. 
Include:
1. Direct answer to their question
2. Key insights or patterns
3. Summary statistics if relevant
4. Any interesting observations

Keep the response conversational and easy to understand.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: analysisPrompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || 'Analysis completed.';
    } catch (error) {
      console.error('Analysis error:', error);
      return `Found ${data.length} records matching your request.`;
    }
  }

  /**
   * Main method that handles both data requests and general requests
   */
  async *streamResponse(
    prompt: string,
    options: ChatOptions = {},
  ): AsyncGenerator<string> {
    const { useMock = false } = options;

    try {
      // Step 1: Classify the request
      const classification = await this.classifyRequest(prompt);
      console.log('🔍 Request classification:', classification);

      if (classification.type === RequestType.DATA_REQUEST) {
        // Step 2: Generate SQL query
        const sqlQuery = await this.generateSQLQuery(prompt, classification);
        console.log('🗃️ Generated SQL:', sqlQuery);

        // Step 3: Execute SQL query
        const data = await this.executeQuery(sqlQuery);
        console.log('📊 Retrieved data:', data.length, 'records');

        // Step 4: Analyze data and stream response
        const analysis = await this.analyzeData(prompt, data, sqlQuery);
        yield* this.streamText(analysis);
      } else {
        // Handle as general request
        if (useMock) {
          yield* this.streamMockResponse(prompt);
        } else {
          yield* this.streamOpenAIResponse(prompt, options);
        }
      }
    } catch (error) {
      console.error('❌ Error in streamResponse:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      yield `I encountered an error processing your request: ${errorMessage}`;
    }
  }

  /**
   * Execute SQL query safely with validation
   */
  private async executeQuery(
    sqlQuery: string,
  ): Promise<Record<string, unknown>[]> {
    try {
      // Validate the SQL query for security
      this.validateSQLQuery(sqlQuery);

      // Execute the query with proper typing
      const result: unknown = await this.dataSource.query(sqlQuery);
      if (Array.isArray(result)) {
        return result as Record<string, unknown>[];
      } else {
        return [];
      }
    } catch (error) {
      console.error('Database query error:', error);

      // Type-safe error handling
      const errorMessage = this.isDatabaseError(error)
        ? error.message
        : 'Database query failed with unknown error';

      throw new Error(`Database query failed: ${errorMessage}`);
    }
  }

  /**
   * Type guard for database errors
   */
  private isDatabaseError(error: unknown): error is DatabaseError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as Record<string, unknown>).message === 'string'
    );
  }

  private validateSQLQuery(sql: string): void {
    const normalizedSQL = sql.toLowerCase().trim();

    // Only allow SELECT statements
    if (!normalizedSQL.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Block dangerous keywords
    const dangerousKeywords = [
      'drop',
      'delete',
      'insert',
      'update',
      'alter',
      'create',
      'truncate',
      'exec',
      'execute',
      'sp_',
      'xp_',
    ];

    for (const keyword of dangerousKeywords) {
      if (normalizedSQL.includes(keyword)) {
        throw new Error(`SQL query contains forbidden keyword: ${keyword}`);
      }
    }

    // Basic SQL injection patterns
    const injectionPatterns = [
      /;.*drop/i,
      /;.*delete/i,
      /union.*select/i,
      /'\s*or\s*'/i,
      /'\s*or\s*1\s*=\s*1/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(sql)) {
        throw new Error('Potentially malicious SQL detected');
      }
    }
  }

  /**
   * Get full response (non-streaming) - for compatibility
   */
  async fullResponse(
    prompt: string,
    options: ChatOptions = {},
  ): Promise<string> {
    let full = '';
    for await (const chunk of this.streamResponse(prompt, options)) {
      full += chunk;
    }
    return full;
  }

  /**
   * Stream text word by word for consistent UX
   */
  private async *streamText(text: string): AsyncGenerator<string> {
    const words = text.split(' ');
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      yield word + ' ';
    }
  }

  private async *streamMockResponse(prompt: string): AsyncGenerator<string> {
    const mockText = `Mock response for: "${prompt}"`;
    yield* this.streamText(mockText);
  }

  private async *streamOpenAIResponse(
    prompt: string,
    options: ChatOptions = {},
  ): AsyncGenerator<string> {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000,
    } = options;

    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature,
        max_tokens: maxTokens,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('❌ OpenAI API Error:', error);
      yield* this.streamMockResponse(`Error: ${prompt}`);
    }
  }
}
