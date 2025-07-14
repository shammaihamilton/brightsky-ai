import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // For now, allow all connections
    // In production, implement proper JWT or session-based authentication
    return true;
  }
}
