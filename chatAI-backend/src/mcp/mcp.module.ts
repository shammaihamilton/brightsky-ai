import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [WeatherModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
