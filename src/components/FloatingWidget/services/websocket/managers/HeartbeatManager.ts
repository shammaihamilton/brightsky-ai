
// ===== managers/HeartbeatManager.ts =====
export class HeartbeatManager {
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private interval: number;
  private onHeartbeat: () => void;
  private onMissedHeartbeat: () => void;

  constructor(
    interval: number,
    onHeartbeat: () => void,
    onMissedHeartbeat: () => void
  ) {
    this.interval = interval;
    this.onHeartbeat = onHeartbeat;
    this.onMissedHeartbeat = onMissedHeartbeat;
  }

  start(): void {
    this.stop();
    console.log(`💓 Starting heartbeat (${this.interval}ms interval)`);

    this.heartbeatTimer = setInterval(() => {
      try {
        this.onHeartbeat();
      } catch (error) {
        console.warn("Heartbeat failed:", error);
        this.onMissedHeartbeat();
      }
    }, this.interval);
  }

  stop(): void {
    if (this.heartbeatTimer) {
      console.log("💓 Stopping heartbeat");
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}