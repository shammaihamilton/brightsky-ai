import { store } from './src/store/index.js';
import { ChatService } from './src/components/FloatingWidget/services/ChatService.js';

// Test script to verify WebSocket integration
async function testChatService() {
    console.log('🧪 Testing ChatService WebSocket Integration...');
    
    const dispatch = store.dispatch;
    const chatService = new ChatService(dispatch);
    
    try {
        console.log('📡 Connecting to WebSocket...');
        await chatService.connect();
        console.log('✅ Connected successfully!');
        
        console.log('📝 Sending test message...');
        await chatService.sendMessage('Hello! What\'s the weather like in New York?');
        console.log('✅ Message sent successfully!');
        
        // Wait for potential response
        setTimeout(() => {
            console.log('📊 Current connection status:', chatService.connectionStatus);
            console.log('🔍 Redux state:', store.getState().chat);
            
            console.log('🧹 Cleaning up...');
            chatService.disconnect();
            console.log('✅ Test completed successfully!');
        }, 3000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        chatService.disconnect();
    }
}

// Run the test
testChatService();
