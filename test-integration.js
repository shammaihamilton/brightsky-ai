// Integration test for WebSocket + Redux flow
import { store } from './src/store/index.js';
import { ChatService } from './src/components/FloatingWidget/services/ChatService.js';

console.log('🧪 Starting WebSocket Integration Test...');

const dispatch = store.dispatch;
const chatService = new ChatService(dispatch);

// Test sequence
async function runIntegrationTest() {
  console.log('\n📋 Test Plan:');
  console.log('1. Test connection to WebSocket');
  console.log('2. Test sending message');
  console.log('3. Test Redux state updates');
  console.log('4. Test backend response handling');
  console.log('5. Test disconnection');
  
  try {
    // Test 1: Connection
    console.log('\n🔗 Test 1: Connection');
    console.log('Connecting to WebSocket...');
    await chatService.connect();
    console.log('✅ Connection successful');
    
    // Test 2: Check Redux state
    console.log('\n📊 Test 2: Redux State');
    const initialState = store.getState();
    console.log('Initial chat state:', initialState.chat);
    
    // Test 3: Send message
    console.log('\n📤 Test 3: Send Message');
    await chatService.sendMessage('Hello! What\'s the weather like in Tel Aviv?');
    console.log('✅ Message sent');
    
    // Test 4: Check Redux state after message
    console.log('\n📊 Test 4: Redux State After Message');
    const afterMessageState = store.getState();
    console.log('Messages in store:', afterMessageState.chat.conversationHistory.length);
    console.log('Connection status:', afterMessageState.chat.connectionStatus);
    
    // Test 5: Wait for response
    console.log('\n⏳ Test 5: Wait for Response');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalState = store.getState();
    console.log('Final messages count:', finalState.chat.conversationHistory.length);
    console.log('Final connection status:', finalState.chat.connectionStatus);
    
    // Test 6: Disconnect
    console.log('\n🔌 Test 6: Disconnect');
    chatService.disconnect();
    console.log('✅ Disconnected successfully');
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runIntegrationTest();
