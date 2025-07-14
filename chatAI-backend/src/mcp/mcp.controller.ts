import { Controller, Post, Get, Param, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ToolOrchestrationService } from './mcp.service';
import { ToolCallResult, ToolDefinition } from './interfaces/tool.interface';

@ApiTags('Tool Orchestration')
@Controller('mcp')
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly toolOrchestrationService: ToolOrchestrationService,
  ) {}

  @Post('tools/:toolName/execute')
  @ApiOperation({ summary: 'Execute a tool with parameters' })
  @ApiParam({ name: 'toolName', description: 'Name of the tool to execute' })
  @ApiResponse({ status: 200, description: 'Tool executed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  async executeTool(
    @Param('toolName') toolName: string,
    @Body() params: Record<string, unknown>,
  ): Promise<ToolCallResult> {
    this.logger.log(`Executing tool: ${toolName}`, { params });
    return await this.toolOrchestrationService.execute(toolName, params);
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get all available tools' })
  @ApiResponse({ status: 200, description: 'List of available tools' })
  getTools(): ToolDefinition[] {
    return this.toolOrchestrationService.getAvailableTools();
  }

  @Get('tools/:toolName')
  @ApiOperation({ summary: 'Get tool definition' })
  @ApiParam({ name: 'toolName', description: 'Name of the tool' })
  @ApiResponse({ status: 200, description: 'Tool definition' })
  @ApiResponse({ status: 404, description: 'Tool not found' })
  getTool(@Param('toolName') toolName: string): ToolDefinition | null {
    return this.toolOrchestrationService.getToolDefinition(toolName) || null;
  }

  @Get('status')
  @ApiOperation({ summary: 'Get tool orchestration service status' })
  @ApiResponse({ status: 200, description: 'Service status' })
  getStatus(): { toolCount: number; availableTools: string[] } {
    return {
      toolCount: this.toolOrchestrationService.getToolCount(),
      availableTools: this.toolOrchestrationService.getToolNames(),
    };
  }
}
