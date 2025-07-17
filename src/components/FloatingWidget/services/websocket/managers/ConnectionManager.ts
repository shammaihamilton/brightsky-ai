// ===== managers/ConnectionManager.ts =====
import type { ConnectionState, RetryConfig } from '../types';

export class ConnectionManager {
  private connectionState: ConnectionState;
  private retryConfig: RetryConfig;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private connectionTimeoutTimer: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;
  private onStateChange: (state: ConnectionState) => void;

  constructor(
    retryConfig: RetryConfig,
    onStateChange: (state: ConnectionState) => void
  ) {
    this.retryConfig = retryConfig;
    this.onStateChange = onStateChange;
    this.connectionState = {
      status: "disconnected",
      retryCount: 0,
      connectionAttempts: 0,
      missedHeartbeats: 0,
    };
  }

  get state(): ConnectionState {
    return { ...this.connectionState };
  }

  get isConnected(): boolean {
    return this.connectionState.status === "connected";
  }

  get isConnecting(): boolean {
    return this.connectionState.status === "connecting";
  }

  setConnected(): void {
    this.connectionState = {
      ...this.connectionState,
      status: "connected",
      retryCount: 0,
      connectionAttempts: this.connectionState.connectionAttempts + 1,
      lastConnectedAt: new Date(),
      missedHeartbeats: 0,
    };
    this.clearTimeouts();
    this.onStateChange(this.connectionState);
  }

  setDisconnected(): void {
    this.connectionState.status = "disconnected";
    this.onStateChange(this.connectionState);
  }

  setError(error: string): void {
    this.connectionState = {
      ...this.connectionState,
      status: "error",
      lastError: error,
    };
    this.onStateChange(this.connectionState);
  }

  setConnecting(): void {
    this.connectionState.status = "connecting";
    this.onStateChange(this.connectionState);
  }

  shouldReconnect(): boolean {
    return (
      !this.isManualDisconnect &&
      this.connectionState.retryCount < this.retryConfig.maxRetries
    );
  }

  scheduleReconnect(reconnectFn: () => Promise<void>): void {
    this.clearTimeouts();
    this.connectionState.status = "reconnecting";
    this.onStateChange(this.connectionState);

    const delay = Math.min(
      this.retryConfig.baseDelay *
        Math.pow(this.retryConfig.backoffFactor, this.connectionState.retryCount),
      this.retryConfig.maxDelay
    );

    console.log(
      `⏰ Scheduling reconnect in ${delay}ms (attempt ${
        this.connectionState.retryCount + 1
      }/${this.retryConfig.maxRetries})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.retryCount++;
      reconnectFn().catch(console.error);
    }, delay);
  }

  setManualDisconnect(): void {
    this.isManualDisconnect = true;
    this.connectionState.retryCount = this.retryConfig.maxRetries;
  }

  incrementMissedHeartbeats(): boolean {
    this.connectionState.missedHeartbeats++;
    return this.connectionState.missedHeartbeats >= this.retryConfig.maxMissedHeartbeats;
  }

  resetHeartbeat(): void {
    this.connectionState.missedHeartbeats = 0;
  }

  private clearTimeouts(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  destroy(): void {
    this.clearTimeouts();
  }
}
