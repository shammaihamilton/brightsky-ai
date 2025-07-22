// src/App.tsx
import { Provider } from 'react-redux';
import { store } from './store';
import FloatingWidget  from './components/FloatingWidget';
import { PageAnalyzer } from './components/PageAnalyzer';  // ← ADD THIS IMPORT
import { usePageAnalysis } from './hooks/usePageAnalysis';   // ← ADD THIS IMPORT
import './App.module.css';

function App() {
  // ← ADD THIS HOOK - This connects PageAnalyzer to the debug hook
  const pageAnalysis = usePageAnalysis({
    autoStart: true,
    analysisInterval: 3000,
    maxHistorySize: 10,
    enableLogging: process.env.NODE_ENV === 'development'
  });

  return (
    <Provider store={store}>
      <div className="app">
        {/* Your existing FloatingWidget */}
        <FloatingWidget />
        
        {/* ← ADD THIS COMPONENT - This is what was missing! */}
        <PageAnalyzer
          isActive={pageAnalysis.isActive}
          onPageAnalyzed={pageAnalysis.handlePageAnalyzed}
          onPageChanged={pageAnalysis.handlePageChanged}
          analysisInterval={3000}
        />
        
        {/* Development Testing Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            maxWidth: '400px',
            maxHeight: '300px',
            overflow: 'auto',
            fontSize: '12px',
            zIndex: 10000,
            fontFamily: 'monospace',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong>🔍 PageAnalyzer Status</strong>
            </div>
            
            <div style={{ marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
              <div><strong>Analyzer State:</strong></div>
              <div>🔧 Active: {pageAnalysis.isActive ? '✅ YES' : '❌ NO'}</div>
              <div>🔄 Analyzing: {pageAnalysis.isAnalyzing ? '✅ YES' : '❌ NO'}</div>
              <div>📊 Current Page: {pageAnalysis.currentPageContext ? '✅ YES' : '❌ NO'}</div>
              <div>📚 History: {pageAnalysis.analysisHistory.length} entries</div>
              <div>📋 Logs: {pageAnalysis.analysisLog.length} entries</div>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '10px', opacity: 0.7 }}>
              💡 Use DropdownMenu Debug section for detailed logs
            </div>
          </div>
        )}
      </div>
    </Provider>
  );
}

export default App;