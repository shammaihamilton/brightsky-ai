import React from 'react';
import styles from '../styles/DropdownMenu.module.css';

interface DropdownMenuProps {
  position: { x: number; y: number };
  isPanelOpen: boolean;
  onChatClick: () => void;
  onSettingsClick: () => void;
  onKeyboardShortcutsClick: () => void;
  onClearConversation: () => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  position,
  isPanelOpen,
  onChatClick,
  onSettingsClick,
  onKeyboardShortcutsClick,
  onClearConversation,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const menuSections = [
    {
      header: "Chat",
      items: [
        {
          icon: isPanelOpen ? (
            // Close icon when chat is open
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // Chat icon when chat is closed
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          ),
          label: isPanelOpen ? "Close Chat" : "Open Chat",
          onClick: onChatClick,
        },
      ],
    },
    {
      header: "Settings",
      items: [
        {
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
          label: "Chat Settings",
          onClick: onSettingsClick,
        },
        {
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10l12-3"
              />
            </svg>
          ),
          label: "Keyboard Shortcuts",
          onClick: onKeyboardShortcutsClick,
        },
      ],
    },
    {
      header: "Actions",
      items: [
        {
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ),
          label: "Clear Conversation",
          onClick: onClearConversation,
          variant: "danger" as const,
        },
      ],
    },
  ];

  return (
    <div 
      className={styles.dropdownContainer}
      style={{
        '--menu-left': `${position.x}px`,
        '--menu-top': `${position.y}px`,
      } as React.CSSProperties}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.dropdownMenu}>
        {/* Close Button */}
        <button 
          className={styles.menuCloseButton} 
          onClick={(e) => {
            console.log("Close button clicked!");
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close menu"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        {menuSections.map((section) => (
          <div key={section.header} className={styles.menuSection}>
            <div className={styles.menuHeader}>{section.header}</div>
            {section.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                className={`${styles.menuItem} ${
                  'variant' in item && item.variant === 'danger' 
                    ? styles.menuItemDanger 
                    : styles.menuItemDefault
                }`}
                onClick={(e) => {
                  console.log(`Menu item clicked: ${item.label}`);
                  e.preventDefault();
                  e.stopPropagation();
                  item.onClick();
                }}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
