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

  createSession(
    sessionId: string,
    initialData?: Partial<SessionData>,
  ): SessionData {
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

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }

  saveSession(sessionId: string, data: SessionData): void {
    data.lastActivity = new Date();
    this.sessions.set(sessionId, data);
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  addMessage(
    sessionId: string,
    message: SessionData['conversationHistory'][0],
  ): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.conversationHistory.push(message);
      this.saveSession(sessionId, session);
    }
  }

  getMessages(
    sessionId: string,
    limit?: number,
  ): SessionData['conversationHistory'] {
    const session = this.getSession(sessionId);
    if (!session) return [];

    const messages = session.conversationHistory;
    return limit ? messages.slice(-limit) : messages;
  }

  updateContext(sessionId: string, context: Record<string, any>): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      this.saveSession(sessionId, session);
    }
  }

  getContext(sessionId: string): Record<string, any> {
    const session = this.getSession(sessionId);
    return session?.context || {};
  }

  updatePreferences(
    sessionId: string,
    preferences: Partial<SessionData['preferences']>,
  ): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.preferences = { ...session.preferences, ...preferences };
      this.saveSession(sessionId, session);
    }
  }

  getPreferences(sessionId: string): SessionData['preferences'] {
    const session = this.getSession(sessionId);
    return session?.preferences || {};
  }

  // Utility methods
  getSessionCount(): number {
    return this.sessions.size;
  }

  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }

  cleanupExpiredSessions(): void {
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
