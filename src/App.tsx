import FloatingChatWidget from './components/FloatingWidget';


function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Simple page with just the floating widget */}
      <div className="p-8">
        <h1 className="text-2xl font-bold">Test Page</h1>
        <p>The floating widget should appear on this page.</p>
      </div>

      {/* Floating Widget */}
      <FloatingChatWidget />
    </div>
  );
}

export default App;
