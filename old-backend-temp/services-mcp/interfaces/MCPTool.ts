export enum ToolCategory {
  UTILITY = 'utility',
  API = 'api',
  DATABASE = 'database',
  EXTERNAL = 'external',
}

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export interface MCPTool {
  name: string;
  description: string;
  category: ToolCategory;

  /**
   * Check if this tool can handle the given message
   */
  canHandle(message: string): Promise<boolean>;

  /**
   * Execute the tool with the given message and context
   */
  execute(
    message: string,
    context?: Record<string, unknown>,
  ): Promise<ToolResult>;

  /**
   * Get the tool schema for AI integration
   */
  getSchema(): ToolSchema;
}
