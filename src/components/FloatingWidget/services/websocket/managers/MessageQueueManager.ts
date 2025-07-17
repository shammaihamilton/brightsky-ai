
// ===== managers/MessageQueueManager.ts =====
import type { QueuedMessage } from '../types';

export class MessageQueueManager {
  private messageQueue: Map<string, QueuedMessage> = new Map();

  add(message: QueuedMessage): void {
    this.messageQueue.set(message.id, message);
    console.log(`📝 Message queued: ${message.id} (queue size: ${this.size})`);
  }

  processAll(sendFn: (content: string) => Promise<void>): void {
    if (this.messageQueue.size === 0) return;

    console.log(`📤 Processing ${this.messageQueue.size} queued messages`);
    const queue = Array.from(this.messageQueue.values());
    this.messageQueue.clear();

    queue.forEach(({ content, resolve, reject }) => {
      sendFn(content).then(resolve).catch(reject);
    });
  }

  rejectAll(error: Error): void {
    console.log(`❌ Rejecting ${this.messageQueue.size} queued messages`);
    const queue = Array.from(this.messageQueue.values());
    this.messageQueue.clear();

    queue.forEach(({ reject }) => reject(error));
  }

  get size(): number {
    return this.messageQueue.size;
  }

  clear(): void {
    this.messageQueue.clear();
  }
}