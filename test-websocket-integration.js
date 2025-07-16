// Test WebSocket Integration
import { ChatService } from './src/components/FloatingWidget/services/ChatService';
import { store } from './src/store';

// Test the WebSocket connection and message flow
async function testWebSocketIntegration() {
  console.log('Testing WebSocket integration...');
  
  const dispatch = store.dispatch;
  const chatService = new ChatService(dispatch);
  
  try {
    // Test connection
    console.log('Connecting to WebSocket...');
    await chatService.connect();
    console.log('✅ WebSocket connected successfully');
    
    // Test sending a message
    console.log('Sending test message...');
    await chatService.sendMessage('Hello, what\'s the weather like?');
    console.log('✅ Message sent successfully');
    
    // Wait for potential responses
    setTimeout(() => {
      console.log('✅ Test completed successfully');
      console.log('Current connection status:', chatService.connectionStatus);
      chatService.disconnect();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWebSocketIntegration();
