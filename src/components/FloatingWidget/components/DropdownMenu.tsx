import React from "react";
import styles from "../styles/DropdownMenu.module.css";
import { usePageAnalysisDebug } from "@/hooks/usePageAnalysisDebug";
import { usePageAnalysis } from "@/hooks/usePageAnalysis";

// Add this type definition at the top, after imports
type MenuIcon = React.ReactElement | string;

interface MenuItem {
  icon: MenuIcon;
  label: string;
  onClick: () => void;
  variant?: "danger";
}

interface MenuSection {
  header: string;
  items: MenuItem[];
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

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
  pageAnalysis: ReturnType<typeof usePageAnalysis>; 
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
  pageAnalysis, // ✅ RECEIVE: pageAnalysis from parent
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<string, boolean>
  >({
    "🔍 Debug": true, // Debug section starts collapsed
  });

  // ✅ CLEAN: Use the fixed debug hook with pageAnalysis parameter
  const {
    // State for displaying counts/status
    isActive,
    isAnalyzing,
    analysisHistory,
    analysisLog,

    // All the logging functions (now extracted back to the hook)
    logCurrentPage,
    logAnalysisHistory,
    logActivityLog,
    logAllData,
    logPageElements,
    logPlatformInfo,
    logViewportInfo,
    logPerformanceStats,
    triggerAnalysisAndLog,
    toggleAnalyzerAndLog,
    clearAllAndLog,
    exportAnalysisData,
    getAnalysisSummary,
  } = usePageAnalysisDebug({
    pageAnalysis,
    options: {
      enableAutoLogging: false, // Manual logging via buttons
      logPrefix: "🔍 DropdownMenu",
      enableGrouping: true,
      showTimestamps: true,
    }
  });

  const toggleSection = (sectionHeader: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionHeader]: !prev[sectionHeader],
    }));
  };

  const menuSections: MenuSection[] = [
    {
      header: "Chat",
      items: [
        {
          icon: isPanelOpen ? (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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

  // Only show debug section in development
  if (process.env.NODE_ENV === "development") {
    menuSections.push({
      header: "🔍 Debug",
      isCollapsible: true,
      defaultCollapsed: true,
      items: [
        {
          icon: "📄",
          label: "Log Current Page",
          onClick: logCurrentPage,
        },
        {
          icon: "🧩",
          label: "Log Page Elements",
          onClick: logPageElements,
        },
        {
          icon: "🏢",
          label: "Log Platform Info",
          onClick: logPlatformInfo,
        },
        {
          icon: "📱",
          label: "Log Viewport Info",
          onClick: logViewportInfo,
        },
        {
          icon: "⚡",
          label: "Log Performance",
          onClick: logPerformanceStats,
        },
        {
          icon: "📚",
          label: `Log History (${analysisHistory.length})`,
          onClick: logAnalysisHistory,
        },
        {
          icon: "📋",
          label: `Log Activity (${analysisLog.length})`,
          onClick: logActivityLog,
        },
        {
          icon: "🎯",
          label: "Log ALL Data",
          onClick: logAllData,
        },
        {
          icon: "🔄",
          label: isAnalyzing ? "Analyzing..." : "Analyze Now",
          onClick: triggerAnalysisAndLog,
        },
        {
          icon: isActive ? "⏸️" : "▶️",
          label: isActive ? "Disable Analyzer" : "Enable Analyzer",
          onClick: toggleAnalyzerAndLog,
        },
        {
          icon: "📤",
          label: "Export Data",
          onClick: exportAnalysisData,
        },
        {
          icon: "📋",
          label: "Get Summary",
          onClick: getAnalysisSummary,
        },
        {
          icon: "🗑️",
          label: "Clear All Data",
          onClick: clearAllAndLog,
        },
      ],
    });
  }

  return (
    <div
      className={styles.dropdownContainer}
      style={
        {
          "--menu-left": `${position.x}px`,
          "--menu-top": `${position.y}px`,
        } as React.CSSProperties
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={styles.dropdownMenu}
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Close Button */}
        <button
          className={styles.menuCloseButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close menu"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "inherit",
          }}
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
            {/* Section Header - Clickable if collapsible */}
            <div
              className={styles.menuHeader}
              onClick={
                section.isCollapsible
                  ? () => toggleSection(section.header)
                  : undefined
              }
              style={{
                cursor: section.isCollapsible ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                userSelect: "none",
              }}
            >
              <span>{section.header}</span>
              {section.isCollapsible && (
                <span
                  style={{
                    fontSize: "12px",
                    opacity: 0.7,
                    transform: collapsedSections[section.header]
                      ? "rotate(0deg)"
                      : "rotate(90deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  ▶
                </span>
              )}
            </div>

            {/* Section Items - Hidden if collapsed */}
            {(!section.isCollapsible || !collapsedSections[section.header]) && (
              <div
                style={{
                  maxHeight: section.isCollapsible ? "200px" : "none",
                  overflowY: section.isCollapsible ? "auto" : "visible",
                  transition: "max-height 0.3s ease",
                }}
              >
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className={`${styles.menuItem} ${
                      "variant" in item && item.variant === "danger"
                        ? styles.menuItemDanger
                        : styles.menuItemDefault
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      item.onClick();
                    }}
                    disabled={item.label.includes("Analyzing...")}
                  >
                    <span className={styles.menuIcon}>
                      {typeof item.icon === "string" ? (
                        <span style={{ fontSize: "14px" }}>{item.icon}</span>
                      ) : (
                        item.icon
                      )}
                    </span>
                    <span className={styles.menuLabel}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;