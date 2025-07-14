import { MCPTool, ToolResult } from '../interfaces/MCPTool';

export class ToolRegistry {
  private tools: Map<string, MCPTool> = new Map();

  /**
   * Register a tool in the registry
   */
  register(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    console.log(`[ToolRegistry] Registered tool: ${tool.name}`);
  }

  /**
   * Unregister a tool from the registry
   */
  unregister(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      console.log(`[ToolRegistry] Unregistered tool: ${toolName}`);
    }
    return removed;
  }

  /**
   * Execute a specific tool by name
   */
  async execute(
    toolName: string,
    query: string,
    context?: Record<string, unknown>,
  ): Promise<ToolResult> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        success: false,
        data: {},
        error: `Tool '${toolName}' not found`,
      };
    }

    try {
      return await tool.execute(query, context);
    } catch (error) {
      console.error(
        `[ToolRegistry] Error executing tool '${toolName}':`,
        error,
      );
      return {
        success: false,
        data: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Find the best tool for a given message
   */
  async findBestTool(message: string): Promise<MCPTool | null> {
    for (const tool of this.tools.values()) {
      try {
        if (await tool.canHandle(message)) {
          return tool;
        }
      } catch (error) {
        console.warn(
          `[ToolRegistry] Error checking tool '${tool.name}':`,
          error,
        );
      }
    }
    return null;
  }

  /**
   * Get all available tools
   */
  getAvailableTools(): Array<{
    name: string;
    description: string;
    category: string;
  }> {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
    }));
  }

  /**
   * Get a specific tool by name
   */
  getTool(toolName: string): MCPTool | undefined {
    return this.tools.get(toolName);
  }

  /**
   * Check if a tool is registered
   */
  hasTool(toolName: string): boolean {
    return this.tools.has(toolName);
  }

  /**
   * Get the count of registered tools
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    const toolNames = Array.from(this.tools.keys());
    this.tools.clear();
    console.log(
      `[ToolRegistry] Cleared ${toolNames.length} tools: ${toolNames.join(', ')}`,
    );
  }
}
