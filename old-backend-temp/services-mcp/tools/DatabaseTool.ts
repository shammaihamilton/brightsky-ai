import {
  MCPTool,
  ToolCategory,
  ToolResult,
  ToolSchema,
} from '../interfaces/MCPTool';

export class DatabaseTool implements MCPTool {
  name = 'database';
  description = 'Query and retrieve data from the application database';
  category = ToolCategory.DATABASE;

  canHandle(message: string): Promise<boolean> {
    const queryKeywords = [
      'search',
      'find',
      'data',
      'database',
      'records',
      'users',
      'history',
      'query',
      'table',
      'sql',
      'count',
      'list',
      'show me',
      'retrieve',
      'get',
      'fetch',
    ];

    const lowerMessage = message.toLowerCase();
    return Promise.resolve(
      queryKeywords.some((keyword) => lowerMessage.includes(keyword)),
    );
  }

  async execute(
    message: string,
    context?: Record<string, unknown>,
  ): Promise<ToolResult> {
    try {
      // This is a simplified example - in production, use proper ORM/query builder
      const queryType = this.determineQueryType(message);

      switch (queryType) {
        case 'user_count':
          return this.getUserCount();
        case 'recent_messages':
          return this.getRecentMessages();
        case 'system_stats':
          return this.getSystemStats();
        default:
          return this.handleGenericQuery(message, context);
      }
    } catch (error) {
      return {
        success: false,
        data: {},
        error: `Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private determineQueryType(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('user') && lowerMessage.includes('count')) {
      return 'user_count';
    }
    if (lowerMessage.includes('recent') && lowerMessage.includes('message')) {
      return 'recent_messages';
    }
    if (lowerMessage.includes('stats') || lowerMessage.includes('statistics')) {
      return 'system_stats';
    }

    return 'generic';
  }

  private getUserCount(): Promise<ToolResult> {
    // Simulate database query
    const userCount = 1250; // This would come from actual DB query

    return Promise.resolve({
      success: true,
      data: {
        results: {
          metric: 'user_count',
          value: userCount,
          description: 'Total number of registered users',
        },
      },
    });
  }

  private getRecentMessages(): Promise<ToolResult> {
    // Simulate database query
    const recentMessages = [
      {
        id: 1,
        user: 'user123',
        message: 'Hello AI',
        timestamp: new Date(),
      },
      {
        id: 2,
        user: 'user456',
        message: 'What is the weather?',
        timestamp: new Date(),
      },
    ];

    return Promise.resolve({
      success: true,
      data: {
        results: {
          messages: recentMessages,
          count: recentMessages.length,
          description: 'Recent chat messages',
        },
      },
    });
  }

  private getSystemStats(): Promise<ToolResult> {
    return Promise.resolve({
      success: true,
      data: {
        results: {
          total_users: 1250,
          active_sessions: 45,
          messages_today: 892,
          uptime: '5 days, 12 hours',
          description: 'System statistics overview',
        },
      },
    });
  }

  private handleGenericQuery(
    message: string,
    context?: Record<string, unknown>,
  ): Promise<ToolResult> {
    // For security, limit what can be queried
    const safeQueries = [
      'public statistics',
      'user preferences',
      'system status',
    ];

    return Promise.resolve({
      success: true,
      data: {
        results: {
          query: message,
          response: 'Generic database query executed',
          available_queries: safeQueries,
          context: context || {},
        },
      },
    });
  }

  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          query_type: {
            type: 'string',
            enum: ['user_count', 'recent_messages', 'system_stats', 'generic'],
            description: 'Type of database query to execute',
          },
          filters: {
            type: 'object',
            description: 'Optional filters for the query',
          },
        },
        required: ['query_type'],
      },
    };
  }
}
