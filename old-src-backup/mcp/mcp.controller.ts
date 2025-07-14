import { Controller, Post, Body } from '@nestjs/common';
import { McpService } from './mcp.service';

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Post()
  async handleTool(
    @Body() body: { tool: string; query: string },
  ): Promise<any> {
    return this.mcpService.handleTool(body.tool, body.query);
  }
}
