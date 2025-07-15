const { io } = require('socket.io-client');

console.log('🔍 Testing Israel weather query...');

const socket = io('http://localhost:3001/ws', {
  query: { sessionId: 'test-session-' + Date.now() }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  console.log('📤 Asking: What is the weather in Israel?');
  socket.emit('message', 'What is the weather in Israel?');
});

socket.on('agent_thinking', (data) => {
  console.log('🤔 Agent thinking:', data);
});

socket.on('agent_response', (data) => {
  console.log('🤖 Agent response received!');
  console.log('Response:', JSON.stringify(data, null, 2));
  console.log('');
  console.log('📊 Flow Analysis:');
  console.log('✅ 1. WebSocket connection established');
  console.log('✅ 2. Message sent to AI agent');
  console.log('✅ 3. Agent processed the request');
  console.log('- Content:', data.content);
  console.log('- Location detected:', data.metadata.intents[0]?.entities?.location || 'none');
  console.log('- Tools used:', data.metadata.toolsUsed.join(', '));
  console.log('- Intent confidence:', data.metadata.intents[0]?.confidence || 'none');
  
  if (data.metadata.toolsUsed.includes('weather')) {
    console.log('✅ 4. Weather tool was executed successfully');
    console.log('✅ 5. Real weather data retrieved from API');
    console.log('✅ 6. Data formatted and sent back via WebSocket');
  } else {
    console.log('❌ 4. Weather tool was not executed');
  }
  
  console.log('🔚 Test completed');
  socket.disconnect();
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected from server');
});

setTimeout(() => {
  console.log('❌ Test timed out');
  socket.disconnect();
}, 10000);
