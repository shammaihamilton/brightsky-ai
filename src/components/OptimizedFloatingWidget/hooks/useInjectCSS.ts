import { useEffect } from 'react';

// Custom hook for injecting CSS animations
export const useInjectCSS = () => {
  useEffect(() => {
    if (!document.getElementById('optimized-floating-widget-css')) {
      const style = document.createElement('style');
      style.id = 'optimized-floating-widget-css';
      style.textContent = `
        @keyframes optimized-widget-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .optimized-widget-pulse {
          animation: optimized-widget-pulse 2s infinite;
        }
        
        /* Smooth transitions for all widget elements */
        .optimized-widget * {
          transition-property: transform, opacity, background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Custom scrollbar for chat messages */
        .optimized-chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .optimized-chat-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        .optimized-chat-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        
        .optimized-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        /* Focus styles for accessibility */
        .optimized-widget-button:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Hover animations */
        .optimized-widget-hover:hover {
          transform: scale(1.05);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
};
