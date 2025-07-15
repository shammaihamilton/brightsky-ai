import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  ToolCallResult,
  ToolExecutor,
  ToolRegistry,
  ParameterValidator,
  ToolDefinition,
} from './interfaces/tool.interface';

@Injectable()
export class ToolOrchestrationService implements ToolExecutor {
  private readonly logger = new Logger(ToolOrchestrationService.name);

  constructor(
    @Inject('TOOL_REGISTRY') private readonly registry: ToolRegistry,
    @Inject('PARAMETER_VALIDATOR')
    private readonly validator: ParameterValidator,
  ) {}

  async execute<T = unknown>(
    toolName: string,
    params: Record<string, unknown>,
  ): Promise<ToolCallResult<T>> {
    const startTime = Date.now();

    try {
      this.logger.log(`Executing tool: ${toolName}`, { params });

      const tool = this.registry.get(toolName);
      if (!tool) {
        throw new Error(`Tool '${toolName}' not found`);
      }

      // Validate parameters
      const validation = this.validator.validate(tool, params);
      if (!validation.isValid) {
        throw new Error(
          `Parameter validation failed: ${validation.errors.join(', ')}`,
        );
      }

      const result = await tool.execute(params);
      const executionTime = Date.now() - startTime;

      this.logger.log(`Tool '${toolName}' executed successfully`, {
        executionTime,
      });

      const response = {
        success: true,
        result: result as T,
        executionTime,
        metadata: {
          toolName,
          timestamp: new Date().toISOString(),
        },
      };

      this.logger.log(`Tool response object:`, response);
      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Tool '${toolName}' execution failed`, {
        error: errorMessage,
        executionTime,
      });

      return {
        success: false,
        error: errorMessage,
        executionTime,
        metadata: {
          toolName,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  // Backwards compatibility method
  async callTool<T = unknown>(
    toolName: string,
    params: Record<string, unknown>,
  ): Promise<ToolCallResult<T>> {
    return this.execute<T>(toolName, params);
  }

  getAvailableTools(): ToolDefinition[] {
    return this.registry.getAll();
  }

  getToolNames(): string[] {
    return this.registry.getNames();
  }

  getToolDefinition(toolName: string): ToolDefinition | undefined {
    return this.registry.get(toolName);
  }

  // Additional utility methods
  hasToolAvailable(toolName: string): boolean {
    return this.registry.get(toolName) !== undefined;
  }

  getToolCount(): number {
    return this.registry.getNames().length;
  }
}
