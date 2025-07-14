// Core interfaces for MCP (Model Context Protocol) system
export interface ToolCallResult<T = unknown> {
  success: boolean;
  result?: T;
  error?: string;
  executionTime?: number;
  metadata?: Record<string, unknown>;
}

export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  enum?: string[];
  format?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  unregister(toolName: string): void;
  get(toolName: string): ToolDefinition | undefined;
  getAll(): ToolDefinition[];
  getNames(): string[];
}

export interface ParameterValidator {
  validate(
    tool: ToolDefinition,
    params: Record<string, unknown>,
  ): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ToolExecutor {
  execute<T = unknown>(
    toolName: string,
    params: Record<string, unknown>,
  ): Promise<ToolCallResult<T>>;
}
