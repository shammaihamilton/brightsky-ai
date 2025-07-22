// src/hooks/usePageAnalysis.ts
import { useState, useCallback, useRef, useEffect } from "react";
import type { PageContext } from "../types/page.types";

interface UsePageAnalysisOptions {
  autoStart?: boolean;
  analysisInterval?: number;
  maxHistorySize?: number;
  enableLogging?: boolean;
}

interface UsePageAnalysisReturn {
  // State
  currentPageContext: PageContext | null;
  isAnalyzing: boolean;
  isActive: boolean;
  analysisHistory: PageContext[];
  analysisLog: string[];

  // Actions
  setActive: (active: boolean) => void;
  updatePageContext: (context: PageContext) => void;
  analyzeCurrentPage: () => Promise<PageContext | null>;
  clearHistory: () => void;
  clearLog: () => void;

  // Event handlers for PageAnalyzer
  handlePageAnalyzed: (pageContext: PageContext) => void;
  handlePageChanged: (
    newContext: PageContext,
    previousContext?: PageContext
  ) => void;
}

export const usePageAnalysis = (
  options: UsePageAnalysisOptions = {}
): UsePageAnalysisReturn => {
  const {
    autoStart = true,
    analysisInterval = 3000,
    maxHistorySize = 10,
    enableLogging = true,
  } = options;

  // Core state
  const [currentPageContext, setCurrentPageContext] =
    useState<PageContext | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isActive, setIsActive] = useState(autoStart);
  const [analysisHistory, setAnalysisHistory] = useState<PageContext[]>([]);
  const [analysisLog, setAnalysisLog] = useState<string[]>([]);

  // Refs for preventing concurrent operations
  const analysisInProgress = useRef(false);
  const lastAnalysisTime = useRef<number>(0);

  // Add message to log
  const addToLog = useCallback(
    (message: string) => {
      if (!enableLogging) return;

      const timestampedMessage = `${new Date().toLocaleTimeString()}: ${message}`;
      setAnalysisLog((prev) => [
        timestampedMessage,
        ...prev.slice(0, maxHistorySize - 1),
      ]);
    },
    [enableLogging, maxHistorySize]
  );

  // Set active state
  const setActive = useCallback(
    (active: boolean) => {
      setIsActive(active);
      if (enableLogging) {
        const message = `🔧 PageAnalyzer ${
          active ? "activated" : "deactivated"
        }`;
        console.log(message);
        addToLog(message);
      }
    },
    [enableLogging, addToLog]
  );

  // Update page context and add to history
  const updatePageContext = useCallback(
    (context: PageContext) => {
      setCurrentPageContext(context);

      // Add to history (avoid duplicates)
      setAnalysisHistory((prev) => {
        // Don't add if it's the same URL and similar timestamp
        const isDuplicate =
          prev.length > 0 &&
          prev[0].url === context.url &&
          Math.abs(prev[0].timestamp.getTime() - context.timestamp.getTime()) <
            1000;

        if (isDuplicate) return prev;

        const newHistory = [context, ...prev];
        return newHistory.slice(0, maxHistorySize);
      });
    },
    [maxHistorySize]
  );

  // Handle page analyzed event (from PageAnalyzer)
  const handlePageAnalyzed = useCallback(
    (pageContext: PageContext) => {
      updatePageContext(pageContext);

      if (enableLogging) {
        const logMessage = `📊 Page analyzed: ${pageContext.url} | Found: ${pageContext.domStructure.forms.length} forms, ${pageContext.domStructure.buttons.length} buttons, ${pageContext.domStructure.inputs.length} inputs | Platform: ${pageContext.metadata.platform.name} | Type: ${pageContext.metadata.pageType} | Time: ${pageContext.loadTime}ms`;

        console.log(logMessage);
        console.log("📋 Full page context:", pageContext);
        addToLog(logMessage);
      }

      lastAnalysisTime.current = Date.now();
    },
    [updatePageContext, enableLogging, addToLog]
  );

  // Handle page changed event (from PageAnalyzer)
  const handlePageChanged = useCallback(
    (newContext: PageContext, previousContext?: PageContext) => {
      if (enableLogging) {
        const changeMessage = `🔄 Page changed from "${
          previousContext?.title || "unknown"
        }" to "${newContext.title}"`;

        console.log(changeMessage);
        console.log("📦 Page change details:", { newContext, previousContext });
        addToLog(changeMessage);
      }

      // Update context will be handled by handlePageAnalyzed
    },
    [enableLogging, addToLog]
  );

  // Analyze current page manually
  const analyzeCurrentPage =
    useCallback(async (): Promise<PageContext | null> => {
      if (analysisInProgress.current || !isActive) {
        return currentPageContext;
      }

      try {
        analysisInProgress.current = true;
        setIsAnalyzing(true);

        if (enableLogging) {
          console.log("🔍 Manual page analysis requested");
          addToLog("🔍 Manual analysis triggered");
        }

        // The actual analysis happens in PageAnalyzer component
        // This is just for manual triggers
        return currentPageContext;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(
            "usePageAnalysis: Error during manual analysis:",
            error
          );
          if (enableLogging) {
            addToLog(`❌ Analysis error: ${error.message}`);
          }
        } else {
          console.error("usePageAnalysis: Unknown error:", error);
        }
        return null;
      } finally {
        analysisInProgress.current = false;
        setIsAnalyzing(false);
      }
    }, [currentPageContext, isActive, enableLogging, addToLog]);

  // Clear history
  const clearHistory = useCallback(() => {
    setAnalysisHistory([]);
    if (enableLogging) {
      console.log("🗑️ Analysis history cleared");
      addToLog("🗑️ History cleared");
    }
  }, [enableLogging, addToLog]);

  // Clear log
  const clearLog = useCallback(() => {
    setAnalysisLog([]);
    console.log("🗑️ Analysis log cleared");
  }, []);

  // Initialize logging
  useEffect(() => {
    if (enableLogging && autoStart) {
      addToLog("🚀 PageAnalyzer initialized");
    }
  }, [enableLogging, autoStart, addToLog]);

  // Performance monitoring
  useEffect(() => {
    if (!enableLogging) return;

    const interval = setInterval(() => {
      const timeSinceLastAnalysis = Date.now() - lastAnalysisTime.current;
      if (isActive && timeSinceLastAnalysis > analysisInterval * 2) {
        addToLog("⚠️ Analysis seems delayed - checking PageAnalyzer component");
      }
    }, analysisInterval * 2);

    return () => clearInterval(interval);
  }, [isActive, analysisInterval, enableLogging, addToLog]);

  return {
    // State
    currentPageContext,
    isAnalyzing,
    isActive,
    analysisHistory,
    analysisLog,

    // Actions
    setActive,
    updatePageContext,
    analyzeCurrentPage,
    clearHistory,
    clearLog,

    // Event handlers for PageAnalyzer
    handlePageAnalyzed,
    handlePageChanged,
  };
};
