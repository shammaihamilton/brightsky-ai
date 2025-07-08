import { type MCPTool, type ToolResult, type ToolSchema } from './tools/interface/MCPTool';
// import { WeatherTool } from './tools/WeatherTool'; // Removed - using backend weather

export class MCPManager {
  private tools: Map<string, MCPTool> = new Map();

  constructor(enabledToolIds: string[]) {
    console.log('[MCPManager] Initializing tools with:', enabledToolIds);
    this.initializeTools(enabledToolIds);
  }

  // Register only enabled tools
  private initializeTools(enabledToolIds: string[]) {
    // TODO: Add weather tool
    console.log('[MCPManager] Initializing tools:', enabledToolIds);
    // Weather tool removed - now handled by backend
    // if (enabledToolIds.includes('weather')) {
    //   this.registerTool(new WeatherTool());
    // }
    
    // Future tools can be added here
  }

  registerTool(tool: MCPTool) {
    console.log('[MCPManager] Registered tool:', tool.name);
    this.tools.set(tool.name, tool);
  }

  getToolByName(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  // Find the best tool(s) for a message
  async findSuitableTools(message: string, context?: Record<string, unknown>): Promise<MCPTool[]> {
    const suitableTools: MCPTool[] = [];
    for (const tool of this.tools.values()) {
      if (await tool.canHandle(message, context)) {
        suitableTools.push(tool);
      }
    }
    return suitableTools;
  }

  // Execute multiple tools and combine results
  async executeTools(tools: MCPTool[], message: string, context?: Record<string, unknown>): Promise<{ tool: string, result: ToolResult }[]> {
    const results = await Promise.allSettled(
      tools.map(tool => tool.execute(message, context))
    );
    return results.map((result, index) => ({
      tool: tools[index].name,
      result: result.status === 'fulfilled' ? result.value : { success: false, error: String(result.reason), data: {} }
    }));
  }

  // Get all available tools for AI function calling
  getAvailableToolSchemas(): ToolSchema[] {
    return Array.from(this.tools.values())
      .map(tool => tool.getSchema());
  }
} 