import React, { useState } from 'react';

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const WidgetPanel: React.FC<WidgetPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('quick-actions');

  console.log('🎛️ WidgetPanel render - isOpen:', isOpen);

  if (!isOpen) {
    console.log('🚫 WidgetPanel not rendering - isOpen is false');
    return null;
  }

  console.log('✅ WidgetPanel rendering!');  // Grammarly-style panel with clean design
  const panelStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    right: '0',
    marginBottom: '12px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
    width: '380px',
    maxWidth: '90vw',
    zIndex: 50,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #f1f3f4',
    backgroundColor: '#fafbfc',
  };

  const tabContainerStyles: React.CSSProperties = {
    display: 'flex',
    borderBottom: '1px solid #f1f3f4',
    backgroundColor: '#fafbfc',
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isActive ? '#1a73e8' : '#5f6368',
    fontWeight: isActive ? '600' : '400',
    fontSize: '14px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #1a73e8' : '2px solid transparent',
    transition: 'all 0.2s ease',
  });

  const quickActionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    width: '100%',
    borderBottom: '1px solid #f1f3f4',
    transition: 'background-color 0.2s ease',
  };

  const iconStyles: React.CSSProperties = {
    width: '20px',
    height: '20px',
    marginRight: '12px',
    color: '#5f6368',
  };

  return (
    <div style={panelStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: '#1a73e8',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '8px',
          }}>
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#202124', 
            margin: 0,
          }}>
            Writing Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '8px',
            border: 'none',
            background: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#5f6368',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f4'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Close panel"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div style={tabContainerStyles}>
        <button 
          style={tabStyles(activeTab === 'quick-actions')}
          onClick={() => setActiveTab('quick-actions')}
        >
          Quick Actions
        </button>
        <button 
          style={tabStyles(activeTab === 'writing-tools')}
          onClick={() => setActiveTab('writing-tools')}
        >
          Writing Tools
        </button>
        <button 
          style={tabStyles(activeTab === 'settings')}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Content */}
      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
        {activeTab === 'quick-actions' && (
          <div>
            <button 
              style={quickActionStyles}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => alert('Check Grammar clicked!')}
            >
              <svg style={iconStyles} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                  Check Grammar
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                  Scan text for grammar and spelling errors
                </div>
              </div>
            </button>

            <button 
              style={quickActionStyles}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => alert('Improve Tone clicked!')}
            >
              <svg style={iconStyles} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                  Improve Tone
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                  Make your writing more professional
                </div>
              </div>
            </button>

            <button 
              style={quickActionStyles}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => alert('Rewrite Text clicked!')}
            >
              <svg style={iconStyles} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                  Rewrite Text
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                  Generate alternative versions
                </div>
              </div>
            </button>

            <button 
              style={quickActionStyles}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => alert('Generate Ideas clicked!')}
            >
              <svg style={iconStyles} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#202124' }}>
                  Generate Ideas
                </div>
                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px' }}>
                  Get writing suggestions and ideas
                </div>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'writing-tools' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#202124', marginBottom: '12px' }}>
                Text Analysis
              </h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
              }}>
                <button style={{
                  padding: '12px',
                  border: '1px solid #e8eaed',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#5f6368',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Word Count
                </button>
                <button style={{
                  padding: '12px',
                  border: '1px solid #e8eaed',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#5f6368',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Readability
                </button>
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#202124', marginBottom: '12px' }}>
                Quick Tools
              </h4>
              <button style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #1a73e8',
                borderRadius: '8px',
                backgroundColor: '#1a73e8',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1557b0'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a73e8'}
              onClick={() => alert('Analyze Page clicked!')}
              >
                Analyze This Page
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#202124',
                marginBottom: '12px',
                cursor: 'pointer',
              }}>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  style={{ marginRight: '8px' }}
                />
                Enable auto-check
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#202124',
                marginBottom: '12px',
                cursor: 'pointer',
              }}>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  style={{ marginRight: '8px' }}
                />
                Show suggestions
              </label>
            </div>
            
            <button style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e8eaed',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#5f6368',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            onClick={() => alert('More settings clicked!')}
            >
              More Settings
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #f1f3f4',
        backgroundColor: '#fafbfc',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '12px', color: '#5f6368' }}>
          Powered by AI Writing Assistant
        </div>
      </div>
    </div>
  );
};

export default WidgetPanel;
