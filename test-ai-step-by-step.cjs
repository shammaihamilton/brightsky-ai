const { io } = require('socket.io-client');

console.log('🔍 Testing AI response step by step...\n');

// Connect to the WebSocket server
const socket = io('http://localhost:3001/ws', {
  transports: ['websocket'],
  autoConnect: true,
  query: {
    sessionId: 'test-session-step-by-step'
  }
});

socket.on('connect', function() {
  console.log('✅ Step 1: Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Send a simple 5-word question
  const message = {
    content: 'Hello how are you today?',
    metadata: { 
      timestamp: new Date().toISOString(),
      source: 'step-test'
    }
  };
  
  console.log('📤 Step 2: Sending simple 5-word question:', message.content);
  socket.emit('user_message', message);
});

socket.on('agent_thinking', function(data) {
  console.log('🤔 Step 3: Agent is thinking:', data);
});

socket.on('agent_response', function(data) {
  console.log('🤖 Step 4: Agent responded!');
  console.log('Response:', JSON.stringify(data, null, 2));
  
  // Check if agent knows about weather tool
  console.log('\n🔍 Step 5: Testing if AI knows about weather tool...');
  const weatherQuestion = {
    content: 'What weather tools do you have?',
    metadata: { 
      timestamp: new Date().toISOString(),
      source: 'step-test'
    }
  };
  
  console.log('📤 Asking about weather tools:', weatherQuestion.content);
  socket.emit('user_message', weatherQuestion);
});

let stepCount = 0;
socket.on('agent_response', function(data) {
  stepCount++;
  
  if (stepCount === 2) {
    console.log('🔍 Step 6: Testing weather tool execution...');
    
    const weatherQuery = {
      content: 'What is the weather in Paris?',
      metadata: { 
        timestamp: new Date().toISOString(),
        source: 'step-test'
      }
    };
    
    console.log('📤 Asking for weather:', weatherQuery.content);
    socket.emit('user_message', weatherQuery);
  }
  
  if (stepCount === 3) {
    console.log('🔍 Step 7: Final weather response received');
    console.log('Final response:', JSON.stringify(data, null, 2));
    
    // Check if weather tool was used
    if (data.metadata && data.metadata.toolsUsed) {
      console.log('✅ Tools used:', data.metadata.toolsUsed);
      if (data.metadata.toolsUsed.includes('weather')) {
        console.log('✅ Weather tool was executed!');
      }
    }
    
    // Check if we got actual weather data
    if (data.content && data.content.includes('undefined')) {
      console.log('❌ Weather data is undefined - there is an issue');
    } else if (data.content && data.content.includes('°C')) {
      console.log('✅ Weather data received successfully!');
    }
    
    setTimeout(() => {
      console.log('\n🔚 Test completed');
      process.exit(0);
    }, 1000);
  }
});

socket.on('error', function(error) {
  console.log('❌ Socket error:', error);
});

socket.on('disconnect', function() {
  console.log('🔌 Disconnected from server');
});

// Set a timeout to exit if no response
setTimeout(() => {
  console.log('⏰ Timeout - test failed');
  process.exit(1);
}, 15000);
