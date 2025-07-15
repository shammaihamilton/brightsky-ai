// Test the agent service directly by creating a minimal test
import { io } from 'socket.io-client';

console.log('🔍 Debugging AI Agent Session Issue');
console.log('='.repeat(50));

// Test Redis connection first
const testRedis = async () => {
  try {
    const response = await fetch('http://localhost:3001/health');
    const data = await response.json();
    console.log('🏥 Health check:', data);
    return data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return null;
  }
};

// Test with more detailed logging
const testConnection = () => {
  return new Promise((resolve) => {
    console.log('\n🔌 Attempting WebSocket connection...');
    
    const sessionId = 'debug-session-' + Date.now();
    console.log('🆔 Using session ID:', sessionId);
    
    const socket = io('http://localhost:3001/ws', {
      transports: ['websocket'],
      autoConnect: true,
      query: {
        sessionId: sessionId
      }
    });

    socket.on('connect', function() {
      console.log('✅ WebSocket connected successfully');
      console.log('🔗 Socket ID:', socket.id);
      
      // Try to send a simple message
      setTimeout(() => {
        console.log('\n📤 Sending test message...');
        socket.emit('user_message', {
          content: 'Hello, can you tell me the weather in New York?',
          metadata: { timestamp: new Date().toISOString() }
        });
      }, 1000);
    });

    socket.on('agent_thinking', function(data) {
      console.log('🤔 Agent thinking:', data);
    });

    socket.on('agent_response', function(data) {
      console.log('✅ Agent response received:', data.content);
      resolve(true);
    });

    socket.on('error', function(error) {
      console.error('❌ Socket error:', error);
      resolve(false);
    });

    socket.on('connect_error', function(error) {
      console.error('❌ Connection error:', error.message);
      resolve(false);
    });

    socket.on('disconnect', function(reason) {
      console.log('🔌 Disconnected:', reason);
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      console.log('⏰ Test timeout');
      socket.disconnect();
      resolve(false);
    }, 10000);
  });
};

const runDebugTest = async () => {
  console.log('\n🚀 Starting debug test...');
  
  // Test health endpoint first
  const health = await testRedis();
  
  // Test WebSocket connection
  const wsResult = await testConnection();
  
  console.log('\n📊 Debug Results:');
  console.log('='.repeat(30));
  console.log(`Health Check: ${health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket Test: ${wsResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!wsResult) {
    console.log('\n💡 Possible issues:');
    console.log('- Redis server not running');
    console.log('- Session service configuration problem');
    console.log('- Database connection issue');
  }
  
  process.exit(0);
};

runDebugTest().catch(console.error);
