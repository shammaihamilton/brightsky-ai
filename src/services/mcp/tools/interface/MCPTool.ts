export enum ToolCategory {
  CALENDAR = 'calendar',
  WEATHER = "weather",
  EMAIL = 'email',
  FILE = 'file',
  API = 'api'
}


export type ToolCategoryList = typeof ToolCategory[keyof typeof ToolCategory];



export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface MCPTool {
  name: string;
  description: string;
  category: ToolCategory;
  canHandle(message: string, context?: Record<string, unknown>): Promise<boolean>;
  execute(message: string, context?: Record<string, unknown>): Promise<ToolResult>;
  getSchema(): ToolSchema;
} 