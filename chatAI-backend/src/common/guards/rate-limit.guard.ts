import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // For now, allow all connections

    // In production, implement proper rate limiting
    return true;
  }
}
