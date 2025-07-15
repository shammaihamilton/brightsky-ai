const { io } = require('socket.io-client');

// Connect to the WebSocket server using Socket.IO client
const socket = io('http://localhost:3001/ws', {
  transports: ['websocket'],
  autoConnect: true,
  query: {
    sessionId: 'test-session-123'
  }
});

socket.on('connect', function() {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Send a message asking for weather
  const message = {
    content: 'What is the weather like in Paris?',
    metadata: { 
      timestamp: new Date().toISOString(),
      source: 'test-client'
    }
  };
  
  console.log('📤 Sending message:', message);
  socket.emit('user_message', message);
});

socket.on('agent_thinking', function(data) {
  console.log('🤔 Agent thinking:', data);
});

socket.on('agent_response', function(data) {
  console.log('🤖 Agent response:', JSON.stringify(data, null, 2));
  
  // Check if the AI used the weather tool
  if (data.toolsUsed && data.toolsUsed.includes('weather')) {
    console.log('✅ Weather tool was used successfully!');
  } else if (data.toolsUsed) {
    console.log('🔧 Tools used:', data.toolsUsed);
    console.log('❌ Weather tool was NOT used');
  } else {
    console.log('❓ No tools information available');
  }
  
  // Exit after getting response
  setTimeout(() => {
    console.log('🔚 Test completed');
    process.exit(0);
  }, 1000);
});

socket.on('error', function(error) {
  console.log('❌ Socket error:', error);
});

socket.on('disconnect', function() {
  console.log('🔌 Disconnected from server');
});

// Set a timeout to exit if no response
setTimeout(() => {
  console.log('⏰ Timeout - no response received');
  process.exit(1);
}, 10000);
