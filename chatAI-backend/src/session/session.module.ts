import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { InMemorySessionService } from './in-memory-session.service';

@Module({
  providers: [
    SessionService,
    // Use in-memory service for development when Redis is not available
    {
      provide: 'SessionService',
      useClass: InMemorySessionService,
    },
  ],
  exports: [SessionService, 'SessionService'],
})
export class SessionModule {}
