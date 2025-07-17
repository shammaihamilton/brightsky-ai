
// WebSocket proxy for Chrome extension
const websocketConnections: Map<string, WebSocket> = new Map();
const connectionTabMap: Map<string, number> = new Map();

interface BackgroundMessage {
  action?: string;
  data?: unknown;
  connectionId?: string;
}

interface BackgroundResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

chrome.runtime.onMessage.addListener(
  (
    request: BackgroundMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: BackgroundResponse) => void
  ) => {
    if (request.action === 'openPopup') {
      // For Manifest V3
      if (chrome.action && chrome.action.openPopup) {
        chrome.action.openPopup()
          .then(() => {
            sendResponse({ success: true });
          })
          .catch((error: Error) => {
            console.error('Failed to open popup:', error);
            sendResponse({ success: false, error: error.message });
          });
      } else {
        // Fallback - the popup will open when user clicks the extension icon
        sendResponse({ success: false, error: 'Popup opening not supported' });
      }
    }
    
    // Handle WebSocket proxy requests
    if (request.action === 'websocket_connect') {
      const connectionId = request.connectionId || 'default';
      const requestData = request.data as { url?: string; sessionId?: string } | undefined;
      
      // Build WebSocket URL with session ID query parameter for your backend
      const sessionId = requestData?.sessionId || `session_${Date.now()}`;
      const wsUrl = `ws://localhost:3002/ws?sessionId=${sessionId}`;
      
      const tabId = sender.tab?.id;
      
      console.log('📤 Background received websocket_connect from tab:', tabId);
      console.log('📤 Connecting to:', wsUrl);
      
      if (!tabId) {
        console.error('❌ No tab ID found for websocket connection');
        sendResponse({ success: false, error: 'No tab ID found' });
        return;
      }
      
      // Store the tab ID for this connection
      connectionTabMap.set(connectionId, tabId);
      
      try {
        const ws = new WebSocket(wsUrl);
        websocketConnections.set(connectionId, ws);
        
        ws.onopen = () => {
          console.log('✅ Background WebSocket connected to:', wsUrl);
          const message = {
            action: 'websocket_event',
            connectionId,
            event: 'connect'
          };
          console.log('📤 Background sending connect event to tab:', tabId);
          chrome.tabs.sendMessage(tabId, message).catch(() => {
            // Tab might be closed, ignore error
          });
        };
        
        ws.onmessage = (event) => {
          try {
            console.log('📨 Background received raw WebSocket message:', event.data);
            
            const message = {
              action: 'websocket_event',
              connectionId,
              event: 'message',
              data: event.data // Send the raw data, let content script parse it
            };
            
            console.log('📤 Background forwarding message to tab:', tabId);
            chrome.tabs.sendMessage(tabId, message).catch(() => {
              // Tab might be closed, ignore error
            });
          } catch (error) {
            console.error('❌ Failed to process WebSocket message:', error);
            const message = {
              action: 'websocket_event',
              connectionId,
              event: 'error',
              data: { error: 'Failed to process message' }
            };
            chrome.tabs.sendMessage(tabId, message).catch(() => {
              // Tab might be closed, ignore error
            });
          }
        };
        
        ws.onclose = (event) => {
          console.log('❌ Background WebSocket disconnected, code:', event.code, 'reason:', event.reason);
          websocketConnections.delete(connectionId);
          const message = {
            action: 'websocket_event',
            connectionId,
            event: 'disconnect',
            data: { code: event.code, reason: event.reason }
          };
          console.log('📤 Background sending disconnect event to tab:', tabId);
          chrome.tabs.sendMessage(tabId, message).catch(() => {
            // Tab might be closed, ignore error
          });
          connectionTabMap.delete(connectionId);
        };
        
        ws.onerror = (error) => {
          console.error('❌ Background WebSocket error:', error);
          const message = {
            action: 'websocket_event',
            connectionId,
            event: 'error',
            data: { error: 'WebSocket connection error' }
          };
          console.log('📤 Background sending error event to tab:', tabId);
          chrome.tabs.sendMessage(tabId, message).catch(() => {
            // Tab might be closed, ignore error
          });
        };
        
        sendResponse({ success: true });
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error);
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Connection failed' 
        });
      }
    }
    
    if (request.action === 'websocket_send') {
      const connectionId = request.connectionId || 'default';
      const ws = websocketConnections.get(connectionId);
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        const requestData = request.data as { event?: string; data?: unknown } | undefined;
        
        // Format the message according to your backend's expectations
        // Your backend expects Socket.IO format: { event: 'user_message', data: {...} }
        const eventName = requestData?.event || 'user_message';
        const eventData = requestData?.data || requestData;
        
        // For raw WebSocket (not Socket.IO), we need to send in the format your backend expects
        // Based on your gateway, it expects JSON with the message content
        const message = eventData;
        
        console.log('📤 Background sending WebSocket message:', message);
        console.log('📤 Event name:', eventName);
        
        try {
          ws.send(JSON.stringify(message));
          sendResponse({ success: true });
        } catch (error) {
          console.error('❌ Failed to send WebSocket message:', error);
          sendResponse({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Send failed' 
          });
        }
      } else {
        console.error('❌ WebSocket not connected, readyState:', ws?.readyState);
        sendResponse({ success: false, error: 'WebSocket not connected' });
      }
    }
    
    if (request.action === 'websocket_disconnect') {
      const connectionId = request.connectionId || 'default';
      const ws = websocketConnections.get(connectionId);
      
      if (ws) {
        ws.close();
        websocketConnections.delete(connectionId);
        connectionTabMap.delete(connectionId);
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'WebSocket not found' });
      }
    }
    
    return true; // Keep the message channel open for async response
  }
);

// Clean up connections when extension is disabled/reloaded
chrome.runtime.onSuspend.addListener(() => {
  console.log('🧹 Extension suspending, cleaning up WebSocket connections');
  websocketConnections.forEach((ws) => {
    ws.close();
  });
  websocketConnections.clear();
  connectionTabMap.clear();
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  // Clean up any connections associated with the closed tab
  for (const [connectionId, connectedTabId] of connectionTabMap.entries()) {
    if (connectedTabId === tabId) {
      const ws = websocketConnections.get(connectionId);
      if (ws) {
        ws.close();
        websocketConnections.delete(connectionId);
      }
      connectionTabMap.delete(connectionId);
      console.log('🧹 Cleaned up connection for closed tab:', tabId);
    }
  }
});

console.log('🚀 Background script loaded and ready');