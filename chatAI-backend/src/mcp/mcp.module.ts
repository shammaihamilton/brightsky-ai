import { Module } from '@nestjs/common';
import { ToolOrchestrationService } from './mcp.service';
import { McpController } from './mcp.controller';
import { InMemoryToolRegistry } from './registry/tool.registry';
import { JsonSchemaValidator } from './validators/parameter.validator';
import { WeatherTool } from './tools/weather.tool';
import { CalendarTool } from './tools/calendar.tool';

@Module({
  controllers: [McpController],
  providers: [
    // Registry
    {
      provide: 'TOOL_REGISTRY',
      useClass: InMemoryToolRegistry,
    },
    // Validator
    {
      provide: 'PARAMETER_VALIDATOR',
      useClass: JsonSchemaValidator,
    },
    // Tools
    WeatherTool,
    CalendarTool,
    // Main service
    ToolOrchestrationService,
    // Tool registration
    {
      provide: 'TOOL_REGISTRATION',
      useFactory: (
        registry: InMemoryToolRegistry,
        weatherTool: WeatherTool,
        calendarTool: CalendarTool,
      ) => {
        registry.register(weatherTool.toDefinition());
        registry.register(calendarTool.toDefinition());
        return registry;
      },
      inject: ['TOOL_REGISTRY', WeatherTool, CalendarTool],
    },
  ],
  exports: [ToolOrchestrationService],
})
export class McpModule {}
