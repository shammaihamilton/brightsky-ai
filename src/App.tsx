import styles from './App.module.css';
import FloatingWidget from './components/FloatingWidget';
import { WebSocketDebugger } from './components/FloatingWidget/components/WebSocketDebugger';


function App() {
  return (
    <div className={styles.appRoot}>
      {/* Simple page with just the floating widget */}
      <div className={styles.pageContent}>
        <h1 className={styles.title}>Test Page</h1>
        <p>The floating widget should appear on this page.</p>
      </div>

      {/* Floating Widget */}
      <FloatingWidget />
      
      {/* WebSocket Debugger for testing */}
      <WebSocketDebugger />
    </div>
  );
}

export default App;
