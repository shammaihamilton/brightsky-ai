import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { validate } from './config/env.validation';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './chat/chat.module';
import { AgentModule } from './agent/agent.module';
import { McpModule } from './mcp/mcp.module';
import { QueueModule } from './queue/queue.module';
import { HealthModule } from './health/health.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database (using your old configuration style)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME', 'postgres'),
          ssl: {
            rejectUnauthorized: false,
          },
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          autoLoadEntities: true,
        };
      },
    }),

    // Logging (simplified)
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      ],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Core modules
    RedisModule,
    QueueModule.forRoot(),
    AuthModule,
    SessionModule,
    HealthModule,
    MonitoringModule,

    // Business modules
    ChatModule,
    AgentModule,
    McpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
