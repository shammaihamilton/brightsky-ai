import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { ToolRegistry } from './registry/ToolRegistry';
import { WeatherTool } from './tools/WeatherTool';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  controllers: [McpController],
  providers: [
    McpService,
    ToolRegistry,
    WeatherTool,
    {
      provide: 'TOOL_REGISTRY_SETUP',
      useFactory: (registry: ToolRegistry, weatherTool: WeatherTool) => {
        registry.registerTool(weatherTool);
        return registry;
      },
      inject: [ToolRegistry, WeatherTool],
    },
  ],
  exports: [McpService, ToolRegistry],
})
export class McpModule {}
