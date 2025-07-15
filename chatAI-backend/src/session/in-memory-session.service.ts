import { Injectable } from '@nestjs/common';

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
export class InMemorySessionService {
  private sessions = new Map<string, SessionData>();
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

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

    this.sessions.set(sessionId, sessionData);

    // Set timeout to clean up session after TTL
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, this.DEFAULT_TTL);

    console.log(`✅ Created in-memory session: ${sessionId}`);
    return sessionData;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }

  async saveSession(sessionId: string, data: SessionData): Promise<void> {
    data.lastActivity = new Date();
    this.sessions.set(sessionId, data);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async addMessage(
    sessionId: string,
    message: SessionData['conversationHistory'][0],
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.conversationHistory.push(message);
      await this.saveSession(sessionId, session);
    }
  }

  async getMessages(
    sessionId: string,
    limit?: number,
  ): Promise<SessionData['conversationHistory']> {
    const session = await this.getSession(sessionId);
    if (!session) return [];

    const messages = session.conversationHistory;
    return limit ? messages.slice(-limit) : messages;
  }

  async updateContext(
    sessionId: string,
    context: Record<string, any>,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      await this.saveSession(sessionId, session);
    }
  }

  async getContext(sessionId: string): Promise<Record<string, any>> {
    const session = await this.getSession(sessionId);
    return session?.context || {};
  }

  async updatePreferences(
    sessionId: string,
    preferences: Partial<SessionData['preferences']>,
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (session) {
      session.preferences = { ...session.preferences, ...preferences };
      await this.saveSession(sessionId, session);
    }
  }

  async getPreferences(sessionId: string): Promise<SessionData['preferences']> {
    const session = await this.getSession(sessionId);
    return session?.preferences || {};
  }

  // Utility methods
  getSessionCount(): number {
    return this.sessions.size;
  }

  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions) {
      const timeSinceActivity = now.getTime() - session.lastActivity.getTime();
      if (timeSinceActivity > this.DEFAULT_TTL) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }
}
