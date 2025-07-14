import { Injectable, Logger } from '@nestjs/common';
import { ToolDefinition, ToolRegistry } from '../interfaces/tool.interface';

@Injectable()
export class InMemoryToolRegistry implements ToolRegistry {
  private readonly logger = new Logger(InMemoryToolRegistry.name);
  private readonly tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.logger.log(`Registering tool: ${tool.name}`);
    this.tools.set(tool.name, tool);
  }

  unregister(toolName: string): void {
    this.logger.log(`Unregistering tool: ${toolName}`);
    this.tools.delete(toolName);
  }

  get(toolName: string): ToolDefinition | undefined {
    return this.tools.get(toolName);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getNames(): string[] {
    return Array.from(this.tools.keys());
  }

  size(): number {
    return this.tools.size;
  }

  has(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  clear(): void {
    this.logger.log('Clearing all tools from registry');
    this.tools.clear();
  }
}
