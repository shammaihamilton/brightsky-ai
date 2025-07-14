// Simple frontend-backend connection test
import { ChatService } from '../src/services/chatService.js';

const chatService = new ChatService();

async function testConnection() {
  console.log('🧪 Testing frontend-backend connection...');
  
  try {
    // Test health check
    console.log('📡 Testing health endpoint...');
    const health = await chatService.checkHealth();
    console.log('✅ Health check result:', health);
    
    if (health.success) {
      console.log('🎉 Backend connection successful!');
      console.log('🔧 Available tools:', health.availableTools);
      
      // Test database mode
      console.log('\n📊 Testing database mode...');
      const dbResponse = await chatService.sendMessage(
        'Show me some test data',
        [],
        { provider: 'openai', directDbAccess: true }
      );
      console.log('✅ Database response:', dbResponse);
      
      // Test AI mode
      console.log('\n🤖 Testing AI mode...');
      const aiResponse = await chatService.sendMessage(
        'Hello! Can you respond?',
        [],
        { provider: 'openai', directDbAccess: false }
      );
      console.log('✅ AI response:', aiResponse);
      
    } else {
      console.log('❌ Backend connection failed');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();
