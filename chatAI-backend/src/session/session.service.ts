import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';

export interface SessionData {
  userId?: string;
  conversationHistory: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }>;
  context: Record<string, any>;
  preferences: {
    theme?: string;
    language?: string;
    aiProvider?: string;
  };
  createdAt: Date;
  lastActivity: Date;
}

@Injectable()
export class SessionService {
  private readonly SESSION_PREFIX = 'session:';
  private readonly DEFAULT_TTL = 3600; // 1 hour

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async createSession(
    sessionId: string,
    initialData?: Partial<SessionData>,
  ): Promise<SessionData> {
    const sessionData: SessionData = {
      conversationHistory: [],
      context: {},
      preferences: {},
      createdAt: new Date(),
      lastActivity: new Date(),
      ...initialData,
    };

    await this.saveSession(sessionId, sessionData);
    return sessionData;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const key = this.getSessionKey(sessionId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    return this.parseSessionData(data);
  }

  async saveSession(
    sessionId: string,
    sessionData: SessionData,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId);
    const serializedData = JSON.stringify(sessionData);
    await this.redis.setex(key, this.DEFAULT_TTL, serializedData);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>,
  ): Promise<SessionData | null> {
    const existingSession = await this.getSession(sessionId);
    if (!existingSession) {
      return null;
    }

    const updatedSession = {
      ...existingSession,
      ...updates,
      lastActivity: new Date(),
    };

    await this.saveSession(sessionId, updatedSession);
    return updatedSession;
  }

  async addMessage(
    sessionId: string,
    message: SessionData['conversationHistory'][0],
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.conversationHistory.push(message);
    session.lastActivity = new Date();
    await this.saveSession(sessionId, session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = this.getSessionKey(sessionId);
    await this.redis.del(key);
  }

  async extendSession(
    sessionId: string,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId);
    await this.redis.expire(key, ttl);
  }

  async getAllSessions(): Promise<string[]> {
    const pattern = this.SESSION_PREFIX + '*';
    const keys = await this.redis.keys(pattern);
    return keys.map((key) => key.replace(this.SESSION_PREFIX, ''));
  }

  cleanup(): void {
    console.log('Session cleanup completed');
  }

  private getSessionKey(sessionId: string): string {
    return this.SESSION_PREFIX + sessionId;
  }

  private isValidSessionData(data: unknown): data is SessionData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const obj = data as Record<string, unknown>;

    return (
      Array.isArray(obj.conversationHistory) &&
      typeof obj.context === 'object' &&
      obj.context !== null &&
      typeof obj.preferences === 'object' &&
      obj.preferences !== null &&
      obj.createdAt !== undefined &&
      obj.lastActivity !== undefined
    );
  }

  private parseSessionData(data: string): SessionData | null {
    try {
      const parsed: unknown = JSON.parse(data);
      if (!this.isValidSessionData(parsed)) {
        console.error('Invalid session data format');
        return null;
      }

      parsed.createdAt = new Date(parsed.createdAt);
      parsed.lastActivity = new Date(parsed.lastActivity);

      parsed.conversationHistory = parsed.conversationHistory.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return parsed;
    } catch (error) {
      console.error('Error parsing session data:', error);
      return null;
    }
  }
}
