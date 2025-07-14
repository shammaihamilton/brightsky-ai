import { Injectable } from '@nestjs/common';

export interface BaseTool {
  name: string;
  description: string;
  aliases: string[];
  execute(query: string): Promise<ToolResult>;
  canHandle(message: string): Promise<boolean>;
}

export interface ToolResult {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class ToolRegistry {
  private tools: Map<string, BaseTool> = new Map();

  registerTool(tool: BaseTool): void {
    this.tools.set(tool.name, tool);
    console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
  }

  async executeTool(toolName: string, query: string): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
        data: { results: {} },
      };
    }

    return await tool.execute(query);
  }

  async canToolHandle(toolName: string, message: string): Promise<boolean> {
    const tool = this.tools.get(toolName);
    return tool ? await tool.canHandle(message) : false;
  }

  getAvailableTools(): Array<{
    name: string;
    description: string;
    aliases: string[];
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      aliases: tool.aliases,
    }));
  }
}
