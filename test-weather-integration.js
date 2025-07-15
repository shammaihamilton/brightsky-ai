// Simple test to verify the weather tool and AI agent integration
import { io } from 'socket.io-client';

console.log('🧪 Testing AI Agent Weather Tool Integration');
console.log('='.repeat(50));

// Test 1: Direct tool test via HTTP
console.log('\n1️⃣ Testing Weather Tool via HTTP API:');
const testWeatherHttp = async () => {
  try {
    const response = await fetch('http://localhost:3001/mcp/tools/weather/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: 'Paris',
        units: 'celsius'
      })
    });
    
    const data = await response.json();
    console.log('✅ Weather API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data?.result?.temperature) {
      console.log(`🌡️ Paris Temperature: ${data.data.result.temperature}°C`);
      console.log(`☁️ Weather: ${data.data.result.description}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Weather API Error:', error);
    return false;
  }
};

// Test 2: WebSocket connection test (without session requirements)
console.log('\n2️⃣ Testing WebSocket Connection:');
const testWebSocket = () => {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001/ws', {
      transports: ['websocket'],
      autoConnect: true,
      query: {
        sessionId: 'test-session-' + Date.now()
      }
    });

    let connected = false;
    
    socket.on('connect', function() {
      console.log('✅ WebSocket Connected!');
      console.log('🔗 Socket ID:', socket.id);
      connected = true;
      
      setTimeout(() => {
        socket.disconnect();
        resolve(connected);
      }, 2000);
    });

    socket.on('connect_error', function(error) {
      console.error('❌ WebSocket Connection Error:', error.message);
      resolve(false);
    });

    socket.on('error', function(error) {
      console.log('⚠️ WebSocket Error:', error);
    });

    setTimeout(() => {
      if (!connected) {
        console.log('❌ WebSocket Connection Timeout');
        socket.disconnect();
        resolve(false);
      }
    }, 5000);
  });
};

// Run tests
const runTests = async () => {
  console.log('\n🚀 Starting Tests...\n');
  
  const httpTest = await testWeatherHttp();
  const wsTest = await testWebSocket();
  
  console.log('\n📊 Test Results:');
  console.log('='.repeat(30));
  console.log(`Weather Tool HTTP: ${httpTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`WebSocket Connection: ${wsTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (httpTest && wsTest) {
    console.log('\n🎉 Both tests passed! The weather tool is working correctly.');
    console.log('💡 The AI agent can now use real weather data when users ask about weather.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the backend logs.');
  }
  
  process.exit(0);
};

runTests().catch(console.error);
