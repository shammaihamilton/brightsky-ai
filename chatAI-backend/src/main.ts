import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

dotenv.config(); // Make sure .env is loaded early

async function bootstrap() {
  // Debug database configuration
  console.log('Database Configuration:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD ? '***' : undefined,
    db: process.env.DB_NAME,
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  // Remove this line - no Socket.IO adapter needed for raw WebSocket
  // app.useWebSocketAdapter(new IoAdapter(app));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'chrome-extension://*',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-ID'],
  });

  // Swagger documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BrightSky AI Agent API')
      .setDescription('Raw WebSocket-based AI agent with MCP integration')
      .setVersion('1.0')
      .addTag('chat', 'Chat and messaging endpoints')
      .addTag('mcp', 'Model Context Protocol endpoints')
      .addTag('agent', 'AI agent orchestration')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // Graceful shutdown
  process.on('SIGINT', () => {
    Logger.log('Received SIGINT, shutting down gracefully...');
    void app.close().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    Logger.log('Received SIGTERM, shutting down gracefully...');
    void app.close().then(() => process.exit(0));
  });

  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
  Logger.log(`WebSocket server is running on: ws://localhost:3002/ws`);
  Logger.log(`Swagger documentation: http://localhost:${port}/api`);
}

void bootstrap();
