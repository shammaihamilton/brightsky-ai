import { Injectable } from '@nestjs/common';
import { BaseTool, ToolResult } from '../tools/base/BaseTool';

@Injectable()
export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  registerTool(tool: BaseTool): void {
    // Register tool by name and all its aliases
    this.tools.set(tool.name, tool);
    tool.aliases.forEach((alias) => {
      this.tools.set(alias.toLowerCase(), tool);
    });
  }

  getTools(): BaseTool[] {
    return Array.from(new Set(this.tools.values()));
  }

  findTool(toolName: string): BaseTool | undefined {
    return this.tools.get(toolName.toLowerCase());
  }

  async executeTool(toolName: string, query: string): Promise<ToolResult> {
    const tool = this.findTool(toolName);

    if (!tool) {
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
        data: { results: {} },
      };
    }

    return tool.execute(query);
  }

  getAvailableTools(): Array<{
    name: string;
    description: string;
    aliases: string[];
  }> {
    return this.getTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      aliases: tool.aliases,
    }));
  }
}
