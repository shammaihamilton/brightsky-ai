// src/hooks/usePageAnalysisDebug.ts
import { useCallback } from "react";
import { usePageAnalysis } from "./usePageAnalysis";
import type { PageContext } from "../types/page.types";

interface UsePageAnalysisDebugOptions {
  enableAutoLogging?: boolean;
  logPrefix?: string;
  enableGrouping?: boolean;
  showTimestamps?: boolean;
}

interface UsePageAnalysisDebugParams {
  pageAnalysis: ReturnType<typeof usePageAnalysis>;
  options?: UsePageAnalysisDebugOptions;
}

interface UsePageAnalysisDebugReturn {
  // All original hook functionality (pass-through)
  currentPageContext: PageContext | null;
  isAnalyzing: boolean;
  isActive: boolean;
  analysisHistory: PageContext[];
  analysisLog: string[];
  setActive: (active: boolean) => void;
  analyzeCurrentPage: () => Promise<PageContext | null>;
  clearHistory: () => void;
  clearLog: () => void;
  handlePageAnalyzed: (pageContext: PageContext) => void;
  handlePageChanged: (
    newContext: PageContext,
    previousContext?: PageContext
  ) => void;

  // Debug logging functions
  logCurrentPage: () => void;
  logAnalysisHistory: () => void;
  logActivityLog: () => void;
  logAllData: () => void;
  logPageElements: () => void;
  logPlatformInfo: () => void;
  logViewportInfo: () => void;
  logPerformanceStats: () => void;

  // Quick actions
  triggerAnalysisAndLog: () => Promise<void>;
  toggleAnalyzerAndLog: () => void;
  clearAllAndLog: () => void;

  // Utility functions
  exportAnalysisData: () => string;
  getAnalysisSummary: () => string;
}

export const usePageAnalysisDebug = ({
  pageAnalysis,
  options = {}
}: UsePageAnalysisDebugParams): UsePageAnalysisDebugReturn => {
  const {
    enableAutoLogging = false,
    logPrefix = "🔍 PageAnalysis",
    enableGrouping = true,
    showTimestamps = true,
  } = options;

  // Extract all the original hook functionality from the passed pageAnalysis
  const {
    currentPageContext,
    isAnalyzing,
    isActive,
    analysisHistory,
    analysisLog,
    setActive,
    analyzeCurrentPage,
    clearHistory,
    clearLog,
    handlePageAnalyzed,
    handlePageChanged,
  } = pageAnalysis;

  // Helper function to create timestamped logs
  const createLog = useCallback(
    (message: string) => {
      const timestamp = showTimestamps
        ? `[${new Date().toLocaleTimeString()}] `
        : "";
      return `${timestamp}${logPrefix} ${message}`;
    },
    [logPrefix, showTimestamps]
  );

  // Helper function for grouped logging
  const logGroup = useCallback(
    (groupName: string, logFn: () => void) => {
      if (enableGrouping) {
        console.group(createLog(groupName));
        logFn();
        console.groupEnd();
      } else {
        console.log(createLog(groupName));
        logFn();
      }
    },
    [enableGrouping, createLog]
  );

  // 1. Log current page analysis
  const logCurrentPage = useCallback(() => {
    logGroup("📄 Current Page Analysis", () => {
      if (currentPageContext) {
        console.log("📋 Basic Info:", {
          url: currentPageContext.url,
          title: currentPageContext.title,
          domain: currentPageContext.domain,
          path: currentPageContext.path,
        });

        console.log("🏢 Platform:", {
          name: currentPageContext.metadata.platform.name,
          version: currentPageContext.metadata.platform.version,
          framework: currentPageContext.metadata.platform.framework,
          isKnownPlatform: currentPageContext.metadata.platform.isKnownPlatform,
        });

        console.log("📝 Page Metadata:", {
          pageType: currentPageContext.metadata.pageType,
          language: currentPageContext.metadata.language,
          direction: currentPageContext.metadata.direction,
          isSecure: currentPageContext.metadata.isSecure,
          hasTrackers: currentPageContext.metadata.hasTrackers,
        });

        console.log("📊 Element Counts:", {
          forms: currentPageContext.domStructure.forms.length,
          buttons: currentPageContext.domStructure.buttons.length,
          inputs: currentPageContext.domStructure.inputs.length,
          links: currentPageContext.domStructure.links.length,
          navigation: currentPageContext.domStructure.navigation.length,
          headings: currentPageContext.domStructure.headings.length,
          images: currentPageContext.domStructure.images.length,
        });

        console.log("⏱️ Performance:", {
          loadTime: `${currentPageContext.loadTime}ms`,
          timestamp: currentPageContext.timestamp.toISOString(),
        });

        console.log("🔧 Analyzer State:", {
          isAnalyzing,
          isActive,
          historyCount: analysisHistory.length,
          logEntries: analysisLog.length,
        });
      } else {
        console.warn("❌ No current page context available");
      }
    });
  }, [
    currentPageContext,
    isAnalyzing,
    isActive,
    analysisHistory.length,
    analysisLog.length,
    logGroup,
  ]);

  // 2. Log analysis history
  const logAnalysisHistory = useCallback(() => {
    logGroup("📚 Analysis History", () => {
      if (analysisHistory.length > 0) {
        console.log(`📊 Total entries: ${analysisHistory.length}`);
        analysisHistory.forEach((context, index) => {
          console.log(`${index + 1}. ${context.title}`, {
            url: context.url,
            platform: context.metadata.platform.name,
            pageType: context.metadata.pageType,
            elements: {
              forms: context.domStructure.forms.length,
              buttons: context.domStructure.buttons.length,
              inputs: context.domStructure.inputs.length,
            },
            loadTime: `${context.loadTime}ms`,
            timestamp: context.timestamp.toLocaleTimeString(),
          });
        });
      } else {
        console.warn("❌ No analysis history available");
      }
    });
  }, [analysisHistory, logGroup]);

  // 3. Log activity log
  const logActivityLog = useCallback(() => {
    logGroup("📋 Activity Log", () => {
      if (analysisLog.length > 0) {
        console.log(`📊 Total entries: ${analysisLog.length}`);
        analysisLog.forEach((entry, index) => {
          console.log(`${index + 1}:`, entry);
        });
      } else {
        console.warn("❌ No activity log entries");
      }
    });
  }, [analysisLog, logGroup]);

  // 4. Log all data at once
  const logAllData = useCallback(() => {
    console.log(createLog("🎯 COMPLETE ANALYSIS DUMP"));
    console.log("=".repeat(50));

    logCurrentPage();
    logAnalysisHistory();
    logActivityLog();

    console.log(createLog("✅ Complete dump finished"));
  }, [logCurrentPage, logAnalysisHistory, logActivityLog, createLog]);

  // 5. Log page elements in detail
  const logPageElements = useCallback(() => {
    logGroup("🧩 Page Elements Detail", () => {
      if (currentPageContext) {
        const { domStructure } = currentPageContext;

        if (domStructure.forms.length > 0) {
          console.log("📝 Forms:", domStructure.forms);
        }

        if (domStructure.buttons.length > 0) {
          console.log("🔘 Buttons:", domStructure.buttons);
        }

        if (domStructure.inputs.length > 0) {
          console.log("📥 Inputs:", domStructure.inputs);
        }

        if (domStructure.links.length > 0) {
          console.log("🔗 Links:", domStructure.links);
        }

        if (domStructure.navigation.length > 0) {
          console.log("🧭 Navigation:", domStructure.navigation);
        }

        console.log("📊 Summary:", {
          totalElements: Object.values(domStructure).flat().length,
          interactiveElements:
            domStructure.forms.length +
            domStructure.buttons.length +
            domStructure.inputs.length +
            domStructure.links.length,
        });
      } else {
        console.warn("❌ No page context for element analysis");
      }
    });
  }, [currentPageContext, logGroup]);

  // 6. Log platform-specific info
  const logPlatformInfo = useCallback(() => {
    logGroup("🏢 Platform Information", () => {
      if (currentPageContext) {
        const platform = currentPageContext.metadata.platform;

        console.log("🎯 Platform Detection:", {
          name: platform.name,
          version: platform.version || "Unknown",
          framework: platform.framework || "Unknown",
          isKnownPlatform: platform.isKnownPlatform,
        });

        console.log("📱 Page Classification:", {
          pageType: currentPageContext.metadata.pageType,
          domain: currentPageContext.domain,
          isSecure: currentPageContext.metadata.isSecure,
        });

        // Platform-specific insights
        if (platform.isKnownPlatform) {
          console.log(`✅ Known platform detected: ${platform.name}`);
          console.log("💡 This enables specialized navigation assistance");
        } else {
          console.log("⚠️ Unknown platform - using generic analysis");
        }
      } else {
        console.warn("❌ No platform information available");
      }
    });
  }, [currentPageContext, logGroup]);

  // 7. Log viewport and layout info
  const logViewportInfo = useCallback(() => {
    logGroup("📱 Viewport & Layout", () => {
      if (currentPageContext) {
        const { viewport } = currentPageContext;

        console.log("📐 Dimensions:", {
          viewport: `${viewport.width}x${viewport.height}`,
          totalPage: `${viewport.scrollSize.width}x${viewport.scrollSize.height}`,
          orientation: viewport.orientation,
          devicePixelRatio: viewport.devicePixelRatio,
        });

        console.log("📜 Scroll Info:", {
          currentPosition: viewport.scrollPosition,
          maxScroll: {
            x: viewport.scrollSize.width - viewport.width,
            y: viewport.scrollSize.height - viewport.height,
          },
          scrollPercentage: {
            x:
              Math.round(
                (viewport.scrollPosition.x /
                  (viewport.scrollSize.width - viewport.width)) *
                  100
              ) || 0,
            y:
              Math.round(
                (viewport.scrollPosition.y /
                  (viewport.scrollSize.height - viewport.height)) *
                  100
              ) || 0,
          },
        });
      } else {
        console.warn("❌ No viewport information available");
      }
    });
  }, [currentPageContext, logGroup]);

  // 8. Log performance statistics
  const logPerformanceStats = useCallback(() => {
    logGroup("⚡ Performance Statistics", () => {
      if (currentPageContext) {
        console.log("📊 Analysis Performance:", {
          lastAnalysisTime: `${currentPageContext.loadTime}ms`,
          timestamp: currentPageContext.timestamp.toISOString(),
          timeSinceAnalysis: `${
            Date.now() - currentPageContext.timestamp.getTime()
          }ms ago`,
        });

        console.log("📈 Historical Performance:", {
          averageAnalysisTime:
            analysisHistory.length > 0
              ? `${Math.round(
                  analysisHistory.reduce((sum, ctx) => sum + ctx.loadTime, 0) /
                    analysisHistory.length
                )}ms`
              : "No data",
          totalAnalyses: analysisHistory.length,
          activityLogEntries: analysisLog.length,
        });

        console.log("🔧 Current State:", {
          isActive,
          isAnalyzing,
          analyzerStatus: isActive
            ? isAnalyzing
              ? "Running"
              : "Ready"
            : "Disabled",
        });
      } else {
        console.warn("❌ No performance data available");
      }
    });
  }, [
    currentPageContext,
    analysisHistory,
    analysisLog.length,
    isActive,
    isAnalyzing,
    logGroup,
  ]);

  // 9. Trigger analysis and log results
  const triggerAnalysisAndLog = useCallback(async () => {
    console.log(createLog("🔄 Triggering manual analysis..."));
    try {
      const result = await analyzeCurrentPage();
      if (result) {
        console.log(createLog("✅ Manual analysis completed"));
        logCurrentPage();
      } else {
        console.warn(createLog("❌ Manual analysis returned null"));
      }
    } catch (error) {
      console.error(createLog("❌ Error during manual analysis:"), error);
    }
  }, [analyzeCurrentPage, logCurrentPage, createLog]);

  // 10. Toggle analyzer and log state
  const toggleAnalyzerAndLog = useCallback(() => {
    const newState = !isActive;
    setActive(newState);
    console.log(
      createLog(`🔧 PageAnalyzer ${newState ? "ENABLED" : "DISABLED"}`)
    );

    logGroup("🔧 Analyzer State Changed", () => {
      console.log("New state:", {
        isActive: newState,
        isAnalyzing,
        willAnalyze: newState && !isAnalyzing,
      });
    });
  }, [isActive, setActive, isAnalyzing, createLog, logGroup]);

  // 11. Clear all data and log action
  const clearAllAndLog = useCallback(() => {
    console.log(createLog("🗑️ Clearing all analysis data..."));

    const beforeCounts = {
      history: analysisHistory.length,
      logs: analysisLog.length,
    };

    clearHistory();
    clearLog();

    console.log(createLog("✅ Data cleared"), {
      clearedHistory: beforeCounts.history,
      clearedLogs: beforeCounts.logs,
    });
  }, [
    clearHistory,
    clearLog,
    analysisHistory.length,
    analysisLog.length,
    createLog,
  ]);

  // 12. Export analysis data as JSON string
  const exportAnalysisData = useCallback((): string => {
    const exportData = {
      currentPage: currentPageContext,
      history: analysisHistory,
      activityLog: analysisLog,
      state: {
        isActive,
        isAnalyzing,
      },
      exportTimestamp: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    console.log(createLog("📤 Analysis data exported"));
    console.log("📋 Copy this JSON data:", jsonString);

    return jsonString;
  }, [
    currentPageContext,
    analysisHistory,
    analysisLog,
    isActive,
    isAnalyzing,
    createLog,
  ]);

  // 13. Get analysis summary
  const getAnalysisSummary = useCallback((): string => {
    if (!currentPageContext) {
      return "No analysis data available";
    }

    const summary = `${currentPageContext.metadata.platform.name} | ${currentPageContext.metadata.pageType} | ${currentPageContext.domStructure.forms.length}F ${currentPageContext.domStructure.buttons.length}B ${currentPageContext.domStructure.inputs.length}I | ${currentPageContext.loadTime}ms`;

    console.log(createLog("📋 Summary:"), summary);
    return summary;
  }, [currentPageContext, createLog]);

  return {
    // Pass-through original hook functionality
    currentPageContext,
    isAnalyzing,
    isActive,
    analysisHistory,
    analysisLog,
    setActive,
    analyzeCurrentPage,
    clearHistory,
    clearLog,
    handlePageAnalyzed,
    handlePageChanged,

    // Debug logging functions
    logCurrentPage,
    logAnalysisHistory,
    logActivityLog,
    logAllData,
    logPageElements,
    logPlatformInfo,
    logViewportInfo,
    logPerformanceStats,

    // Quick actions
    triggerAnalysisAndLog,
    toggleAnalyzerAndLog,
    clearAllAndLog,

    // Utility functions
    exportAnalysisData,
    getAnalysisSummary,
  };
};