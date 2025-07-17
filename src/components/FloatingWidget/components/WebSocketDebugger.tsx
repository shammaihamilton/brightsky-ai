import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { useWidgetChat } from '../hooks';
import { selectConnectionStatus } from '../../../store/slices/chatSlice';
import { selectConversationHistory } from '../../../store/selectors/chatSelectors';
import styles from '../styles/WebSocketDebugger.module.css';

export const WebSocketDebugger: React.FC = () => {
  const chatService = useWidgetChat();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const messages = useAppSelector(selectConversationHistory);
  const [testMessage, setTestMessage] = useState('What\'s the weather like in New York?');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    addLog(`Connection status changed: ${connectionStatus}`);
  }, [connectionStatus]);

  useEffect(() => {
    addLog(`Message count: ${messages.length}`);
  }, [messages.length]);

  const handleConnect = async () => {
    try {
      addLog('Attempting to connect...');
      await chatService.connect();
      addLog('✅ Connection successful');
    } catch (error) {
      addLog(`❌ Connection failed: ${error}`);
    }
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim()) return;
    
    try {
      addLog(`📤 Sending message: "${testMessage}"`);
      await chatService.sendMessage(testMessage);
      addLog('✅ Message sent successfully');
    } catch (error) {
      addLog(`❌ Send failed: ${error}`);
    }
  };

  const handleDisconnect = () => {
    addLog('🔌 Disconnecting...');
    chatService.disconnect();
    addLog('✅ Disconnected');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className={styles.debugger}>
      <div className={styles.header}>
        <h3>WebSocket Integration Debugger</h3>
        <div className={styles.status}>
          Status: <span className={styles[connectionStatus]}>{connectionStatus}</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button onClick={handleConnect} disabled={connectionStatus === 'connected'}>
          Connect
        </button>
        <button onClick={handleDisconnect} disabled={connectionStatus === 'disconnected'}>
          Disconnect
        </button>
        <button onClick={clearLogs}>Clear Logs</button>
      </div>

      <div className={styles.messageTest}>
        <input
          type="text"
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Test message"
          className={styles.messageInput}
        />
        <button 
          onClick={handleSendMessage}
          disabled={connectionStatus !== 'connected' || !testMessage.trim()}
        >
          Send Test Message
        </button>
      </div>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <strong>Messages in Redux:</strong> {messages.length}
        </div>
        <div className={styles.infoItem}>
          <strong>Connection Status:</strong> {connectionStatus}
        </div>
        <div className={styles.infoItem}>
          <strong>Chat Service Status:</strong> {chatService.connectionStatus}
        </div>
      </div>

      <div className={styles.logs}>
        <h4>Debug Logs</h4>
        <div className={styles.logContainer}>
          {logs.map((log, index) => (
            <div key={index} className={styles.logEntry}>
              {log}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.messages}>
        <h4>Redux Messages ({messages.length})</h4>
        <div className={styles.messageContainer}>
          {messages.map((message, index) => (
            <div key={index} className={styles.messageEntry}>
              <strong>{message.sender}:</strong> {message.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
