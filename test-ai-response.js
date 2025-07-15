import { io } from 'socket.io-client';

console.log('🤖 Testing AI Agent Response to Weather Questions');
console.log('='.repeat(50));

let responseReceived = false;
let toolUsed = false;

// Connect to WebSocket with a fresh session
const socket = io('http://localhost:3001/ws', {
  transports: ['websocket'],
  autoConnect: true,
  query: {
    sessionId: 'test-ai-session-' + Date.now()
  }
});

socket.on('connect', function() {
  console.log('✅ Connected to WebSocket server');
  console.log('🔗 Socket ID:', socket.id);
  
  // Wait a moment then send weather question
  setTimeout(() => {
    const weatherQuestion = {
      content: 'What is the weather like in Tokyo?',
      metadata: { 
        timestamp: new Date().toISOString(),
        source: 'ai-test-client'
      }
    };
    
    console.log('\n📤 Sending weather question:', weatherQuestion.content);
    socket.emit('user_message', weatherQuestion);
  }, 1000);
});

socket.on('agent_thinking', function(data) {
  console.log('🤔 Agent is thinking...');
  if (data.content) {
    console.log('💭 Thought:', data.content);
  }
});

socket.on('agent_response', function(data) {
  console.log('\n🤖 AI Agent Response Received:');
  console.log('📝 Content:', data.content);
  
  if (data.toolsUsed && data.toolsUsed.length > 0) {
    console.log('🔧 Tools Used:', data.toolsUsed);
    if (data.toolsUsed.includes('weather')) {
      console.log('✅ Weather tool was used!');
      toolUsed = true;
    }
  }
  
  if (data.metadata) {
    console.log('📊 Metadata:', JSON.stringify(data.metadata, null, 2));
  }
  
  responseReceived = true;
});

socket.on('error', function(error) {
  console.error('❌ Socket error:', error);
});

socket.on('connect_error', function(error) {
  console.error('❌ Connection error:', error);
});

socket.on('disconnect', function(reason) {
  console.log('🔌 Disconnected:', reason);
});

// Wait for response and then summarize
setTimeout(() => {
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS:');
  console.log('='.repeat(50));
  
  if (responseReceived) {
    console.log('✅ AI Agent DID respond to weather question');
    if (toolUsed) {
      console.log('✅ Weather tool WAS used by the AI');
      console.log('🎉 FULL INTEGRATION WORKING!');
    } else {
      console.log('⚠️ AI responded but weather tool was NOT used');
      console.log('💡 AI might have answered without calling the tool');
    }
  } else {
    console.log('❌ AI Agent did NOT respond');
    console.log('🔍 Check backend logs for errors');
  }
  
  socket.disconnect();
  process.exit(0);
}, 15000); // Wait 15 seconds for response
