const { io } = require('socket.io-client');

// Test WebSocket connection
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Test sending a message
  socket.emit('user_message', {
    message: 'Hello from test client!',
    sessionId: 'test-session-123'
  });
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket server');
});

socket.on('assistant_message', (data) => {
  console.log('📥 Received assistant message:', data);
});

socket.on('error', (error) => {
  console.error('❌ WebSocket error:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});

// Keep the connection alive for testing
setTimeout(() => {
  console.log('🔌 Closing connection...');
  socket.disconnect();
  process.exit(0);
}, 5000);
