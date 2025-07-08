import React, { useState, useRef, useEffect } from 'react';
import { useToolSettings } from '../hooks/useToolSettings';

export const ToolSelectionSection: React.FC = () => {
  const { enabledTools, toggleTool, availableTools } = useToolSettings();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="tool-dropdown" ref={dropdownRef}>
      <button
        className="tool-dropdown-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="tool-dropdown-title">Tools</span>
        <span className="tool-dropdown-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="tool-dropdown-menu" role="listbox">
          {availableTools.map(tool => (
            <label key={tool.id} className="tool-dropdown-item">
              <input
                type="checkbox"
                checked={enabledTools.includes(tool.id)}
                onChange={() => toggleTool(tool.id)}
                className="tool-dropdown-checkbox"
              />
              <span className="tool-dropdown-checkbox-icon">
                {enabledTools.includes(tool.id) ? '☑' : '☐'}
              </span>
              <span className="tool-dropdown-label">{tool.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}; 