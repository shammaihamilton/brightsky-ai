import {
  ToolDefinition,
  ParameterDefinition,
} from '../../interfaces/tool.interface';

export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly parameters: Record<string, ParameterDefinition>;

  abstract execute(params: Record<string, unknown>): Promise<unknown>;

  toDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      execute: (params: Record<string, unknown>) => this.execute(params),
    };
  }

  protected validateRequiredParams(
    params: Record<string, unknown>,
    requiredParams: string[],
  ): void {
    for (const param of requiredParams) {
      if (!(param in params)) {
        throw new Error(`Required parameter '${param}' is missing`);
      }
    }
  }

  protected getParam<T>(
    params: Record<string, unknown>,
    key: string,
    defaultValue?: T,
  ): T {
    const value = params[key];
    if (value !== undefined) {
      return value as T;
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Parameter '${key}' is required but not provided`);
  }
}
