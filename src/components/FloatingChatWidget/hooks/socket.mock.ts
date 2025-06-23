// Mock socket for Chrome extension development
type SocketCallback = (...args: unknown[]) => void;

export const socket = {
  connected: false,
  connect: () => console.log('🔗 Mock socket connect'),
  disconnect: () => console.log('🔌 Mock socket disconnect'),
  on: (event: string, callback: SocketCallback) => {
    console.log(`📡 Mock socket listening for: ${event}`);
    // Simulate connection for testing
    if (event === 'connect') {
      setTimeout(() => callback(), 100);
    }
    // Simulate AI message events for testing
    if (event === 'ai_message_chunk') {
      // You can add mock chunk responses here later
      // Example: setTimeout(() => callback({ messageId: 'test', chunk: 'Hello' }), 200);
    }
    if (event === 'ai_message_done') {
      // You can add mock done responses here later
      // Example: setTimeout(() => callback({ messageId: 'test' }), 1000);
    }
    if (event === 'ai_message_error') {
      // You can add mock error responses here later
    }
  },
  off: (event: string) => {
    console.log(`🚫 Mock socket remove listener: ${event}`);
  },
  emit: (event: string, data?: unknown) => {
    console.log(`📤 Mock socket emit: ${event}`, data);
    // You can add mock responses here for testing
  }
};
