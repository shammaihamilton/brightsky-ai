import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST');
        const nodeEnv = configService.get<string>('NODE_ENV');
        const disableRedis = configService.get<boolean>('DISABLE_REDIS');

        // Skip Redis entirely if disabled or not configured in development
        if (disableRedis || (!redisHost && nodeEnv !== 'production')) {
          console.log('⚠️ Redis disabled - using in-memory fallback');
          return null;
        }

        const redis = new Redis({
          host: redisHost || 'localhost',
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          enableReadyCheck: true,
          maxRetriesPerRequest: 1, // Reduce retries
          lazyConnect: true,
          connectTimeout: 3000, // 3 second timeout
        });

        redis.on('connect', () => {
          console.log('✅ Connected to Redis');
        });

        redis.on('error', (error) => {
          // Silently handle Redis errors in development when Redis is not required
          if (process.env.NODE_ENV !== 'production') {
            console.log('⚠️ Redis not available - using in-memory fallback');
          } else {
            console.error('❌ Redis connection error:', error.message);
          }
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
