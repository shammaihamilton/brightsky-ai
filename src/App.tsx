import styles from './App.module.css';
import FloatingWidgetOOP from './components/FloatingWidgetOOP';


function App() {
  return (
    <div className={styles.appRoot}>
      {/* Simple page with just the floating widget */}
      <div className={styles.pageContent}>
        <h1 className={styles.title}>Test Page</h1>
        <p>The floating widget should appear on this page.</p>
      </div>

      {/* Floating Widget */}
      <FloatingWidgetOOP />
    </div>
  );
}

export default App;
