// Simple code block component for Chrome extension (no dynamic imports)
import React from 'react';

interface SimpleCodeBlockProps {
  children: string;
  className?: string;
}

export const SimpleCodeBlock: React.FC<SimpleCodeBlockProps> = ({ 
  children, 
  className = ''
}) => {
  // Extract language from className (e.g., "language-javascript" -> "javascript")
  const language = className.replace(/language-/, '') || 'code';
  
  return (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 text-sm">
        <span className="font-mono">{language}</span>
        <button
          onClick={() => navigator.clipboard?.writeText(children)}
          className="text-gray-400 hover:text-white transition-colors"
          title="Copy code"
        >
          Copy
        </button>
      </div>      <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
        <code className={`language-${language}`}>
          {children}
        </code>
      </pre>
    </div>
  );
};
