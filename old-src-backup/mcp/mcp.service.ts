import { Injectable } from '@nestjs/common';
import { ToolRegistry } from './registry/ToolRegistry';
import { ToolResult } from './tools/base/BaseTool';

@Injectable()
export class McpService {
  constructor(private readonly toolRegistry: ToolRegistry) {}

  async handleTool(tool: string, query: string): Promise<ToolResult> {
    return this.toolRegistry.executeTool(tool, query);
  }

  getAvailableTools() {
    return this.toolRegistry.getAvailableTools();
  }
}
