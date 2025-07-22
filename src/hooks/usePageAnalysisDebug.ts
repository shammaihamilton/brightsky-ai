// src/hooks/usePageAnalysisDebug.ts
import { useCallback, useEffect, useRef } from "react";
import { usePageAnalysis } from "./usePageAnalysis";
import type { PageContext } from "../types/page.types";
import type { InputElement } from "@/types/elements.types";

interface UsePageAnalysisDebugOptions {
  enableAutoLogging?: boolean;
  logPrefix?: string;
  enableGrouping?: boolean;
  showTimestamps?: boolean;
  autoLogLevel?: 'minimal' | 'standard' | 'detailed' | 'verbose';
}

interface UsePageAnalysisDebugParams {
  pageAnalysis: ReturnType<typeof usePageAnalysis> | null;
  options?: UsePageAnalysisDebugOptions;
}

interface UsePageAnalysisDebugReturn {
  // All original hook functionality (enhanced with auto-logging)
  currentPageContext: PageContext | null;
  isAnalyzing: boolean;
  isActive: boolean;
  analysisHistory: PageContext[];
  analysisLog: string[];
  setActive: (active: boolean) => void;
  analyzeCurrentPage: () => Promise<PageContext | null>;
  clearHistory: () => void;
  clearLog: () => void;
  handlePageAnalyzed: (pageContext: PageContext) => void; // ✅ Enhanced with auto-logging
  handlePageChanged: (
    newContext: PageContext,
    previousContext?: PageContext
  ) => void; // ✅ Enhanced with auto-logging

  // Debug logging functions
  logCurrentPage: () => void;
  logAnalysisHistory: () => void;
  logActivityLog: () => void;
  logAllData: () => void;
  logComprehensivePageData: () => void; // ✅ NEW: Comprehensive page analysis
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
    enableAutoLogging = true, // ✅ NEW: Auto-logging enabled by default
    logPrefix = "🔍 PageAnalysis",
    enableGrouping = true,
    showTimestamps = true,
    autoLogLevel = 'standard', // ✅ NEW: Control auto-log verbosity
  } = options;

  // ✅ NEW: Track the original handlers to avoid infinite loops
  const originalHandlersRef = useRef<{
    handlePageAnalyzed?: (pageContext: PageContext) => void;
    handlePageChanged?: (newContext: PageContext, previousContext?: PageContext) => void;
  }>({});

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
    handlePageAnalyzed: originalHandlePageAnalyzed,
    handlePageChanged: originalHandlePageChanged,
  } = pageAnalysis || {
    currentPageContext: null,
    isAnalyzing: false,
    isActive: false,
    analysisHistory: [],
    analysisLog: [],
    setActive: () => {},
    analyzeCurrentPage: async () => null,
    clearHistory: () => {},
    clearLog: () => {},
    handlePageAnalyzed: () => {},
    handlePageChanged: () => {},
  };

  // ✅ NEW: Store original handlers
  useEffect(() => {
    originalHandlersRef.current.handlePageAnalyzed = originalHandlePageAnalyzed;
    originalHandlersRef.current.handlePageChanged = originalHandlePageChanged;
  }, [originalHandlePageAnalyzed, originalHandlePageChanged]);

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

  // ✅ NEW: Auto-log when page is analyzed
  const autoLogPageAnalyzed = useCallback((pageContext: PageContext) => {
    if (!enableAutoLogging) return;

    const platform = pageContext.metadata.platform.name;
    const pageType = pageContext.metadata.pageType;
    const loadTime = pageContext.loadTime;
    const elementCounts = {
      forms: pageContext.domStructure.forms.length,
      buttons: pageContext.domStructure.buttons.length,
      inputs: pageContext.domStructure.inputs.length,
      links: pageContext.domStructure.links.length,
    };

    switch (autoLogLevel) {
      case 'minimal':
        console.log(createLog(`📄 Page analyzed: ${pageContext.title} (${loadTime}ms)`));
        break;

      case 'standard':
        console.log(createLog(`📄 Page analyzed`), {
          title: pageContext.title,
          platform: platform,
          pageType: pageType,
          elements: `${elementCounts.forms}F ${elementCounts.buttons}B ${elementCounts.inputs}I ${elementCounts.links}L`,
          loadTime: `${loadTime}ms`,
        });
        break;

      case 'detailed':
        logGroup("📄 Page Analyzed (Auto-log)", () => {
          console.log("📋 Basic Info:", {
            title: pageContext.title,
            url: pageContext.url,
            platform: platform,
            pageType: pageType,
          });
          console.log("📊 Elements:", elementCounts);
          console.log("⚡ Performance:", { loadTime: `${loadTime}ms` });
        });
        break;

      case 'verbose':
        logGroup("📄 DETAILED Page Analysis (Auto-log)", () => {
          console.log("📋 Page Info:", {
            title: pageContext.title,
            url: pageContext.url,
            domain: pageContext.domain,
            path: pageContext.path,
          });
          console.log("🏢 Platform:", pageContext.metadata.platform);
          console.log("📊 Element Summary:", elementCounts);
          console.log("📱 Viewport:", {
            size: `${pageContext.viewport.width}x${pageContext.viewport.height}`,
            orientation: pageContext.viewport.orientation,
          });
          console.log("⚡ Performance:", {
            loadTime: `${loadTime}ms`,
            timestamp: pageContext.timestamp.toLocaleTimeString(),
          });
        });
        break;
    }
  }, [enableAutoLogging, autoLogLevel, createLog, logGroup]);

  // ✅ NEW: Auto-log when page changes
  const autoLogPageChanged = useCallback(
    (newContext: PageContext, previousContext?: PageContext) => {
      if (!enableAutoLogging) return;

      if (previousContext) {
        const urlChanged = newContext.url !== previousContext.url;
        const titleChanged = newContext.title !== previousContext.title;
        const platformChanged = newContext.metadata.platform.name !== previousContext.metadata.platform.name;

        if (autoLogLevel === 'minimal') {
          console.log(createLog(`🔄 Page changed: ${previousContext.title} → ${newContext.title}`));
        } else {
          logGroup("🔄 Page Changed (Auto-log)", () => {
            if (urlChanged) {
              console.log("🌐 URL changed:", {
                from: previousContext.url,
                to: newContext.url,
              });
            }
            if (titleChanged) {
              console.log("📄 Title changed:", {
                from: previousContext.title,
                to: newContext.title,
              });
            }
            if (platformChanged) {
              console.log("🏢 Platform changed:", {
                from: previousContext.metadata.platform.name,
                to: newContext.metadata.platform.name,
              });
            }

            const elementChanges = {
              forms: newContext.domStructure.forms.length - previousContext.domStructure.forms.length,
              buttons: newContext.domStructure.buttons.length - previousContext.domStructure.buttons.length,
              inputs: newContext.domStructure.inputs.length - previousContext.domStructure.inputs.length,
            };

            console.log("📊 Element changes:", elementChanges);
          });
        }
      } else {
        console.log(createLog(`🆕 Initial page analysis: ${newContext.title}`));
      }
    },
    [enableAutoLogging, autoLogLevel, createLog, logGroup]
  );

  // ✅ ENHANCED: Wrap handlers with auto-logging
  const enhancedHandlePageAnalyzed = useCallback(
    (pageContext: PageContext) => {
      // Call original handler first
      originalHandlersRef.current.handlePageAnalyzed?.(pageContext);
      
      // Then auto-log
      autoLogPageAnalyzed(pageContext);
    },
    [autoLogPageAnalyzed]
  );

  const enhancedHandlePageChanged = useCallback(
    (newContext: PageContext, previousContext?: PageContext) => {
      // Call original handler first
      originalHandlersRef.current.handlePageChanged?.(newContext, previousContext);
      
      // Then auto-log
      autoLogPageChanged(newContext, previousContext);
    },
    [autoLogPageChanged]
  );

  // ✅ EXISTING: All your existing debug functions stay the same
  const logCurrentPage = useCallback(() => {
    if (!pageAnalysis) {
      console.warn("❌ PageAnalysis not available - debug features disabled");
      return;
    }
    
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
          textContent: currentPageContext.domStructure.textContent?.length || 0, // ✅ NEW: Text content
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
    pageAnalysis
  ]);

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

  const logAllData = useCallback(() => {
    console.log(createLog("🎯 COMPLETE ANALYSIS DUMP"));
    console.log("=".repeat(50));

    logCurrentPage();
    logAnalysisHistory();
    logActivityLog();

    console.log(createLog("✅ Complete dump finished"));
  }, [logCurrentPage, logAnalysisHistory, logActivityLog, createLog]);

  // ✅ NEW: Log comprehensive page data analysis (like handlePageAnalyzed but more detailed)
  const logComprehensivePageData = useCallback(() => {
    if (!pageAnalysis || !currentPageContext) {
      console.warn("❌ No page data available for comprehensive analysis");
      return;
    }

    logGroup("🎯 COMPREHENSIVE PAGE DATA ANALYSIS", () => {
      const pageContext = currentPageContext;
      
      // 📋 Basic Page Information
      console.log("📋 PAGE INFORMATION:", {
        title: pageContext.title,
        url: pageContext.url,
        domain: pageContext.domain,
        path: pageContext.path,
        timestamp: pageContext.timestamp.toISOString(),
        loadTime: `${pageContext.loadTime}ms`,
      });

      // 🏢 Platform & Metadata
      console.log("🏢 PLATFORM & METADATA:", {
        platform: {
          name: pageContext.metadata.platform.name,
          version: pageContext.metadata.platform.version,
          framework: pageContext.metadata.platform.framework,
          isKnownPlatform: pageContext.metadata.platform.isKnownPlatform,
        },
        pageType: pageContext.metadata.pageType,
        language: pageContext.metadata.language,
        direction: pageContext.metadata.direction,
        charset: pageContext.metadata.charset,
        isSecure: pageContext.metadata.isSecure,
        hasTrackers: pageContext.metadata.hasTrackers,
      });

      // 📱 Viewport Information
      console.log("📱 VIEWPORT & LAYOUT:", {
        dimensions: `${pageContext.viewport.width}x${pageContext.viewport.height}`,
        orientation: pageContext.viewport.orientation,
        devicePixelRatio: pageContext.viewport.devicePixelRatio,
        scrollPosition: pageContext.viewport.scrollPosition,
        totalPageSize: `${pageContext.viewport.scrollSize.width}x${pageContext.viewport.scrollSize.height}`,
      });

      // 📊 Element Counts Summary
      const domStructure = pageContext.domStructure;
      const elementCounts = {
        forms: domStructure.forms.length,
        buttons: domStructure.buttons.length,
        inputs: domStructure.inputs.length,
        links: domStructure.links.length,
        navigation: domStructure.navigation.length,
        menus: domStructure.menus.length,
        headings: domStructure.headings.length,
        paragraphs: domStructure.paragraphs.length,
        lists: domStructure.lists.length,
        images: domStructure.images.length,
        videos: domStructure.videos.length,
        containers: domStructure.containers.length,
        modals: domStructure.modals.length,
        popups: domStructure.popups.length,
        loadingElements: domStructure.loadingElements.length,
        errorElements: domStructure.errorElements.length,
        landmarks: domStructure.landmarks.length,
        focusableElements: domStructure.focusableElements.length,
        textContent: domStructure.textContent?.length || 0,
      };

      console.log("📊 ELEMENT COUNTS:", elementCounts);

      // 🎯 Interactive Elements (Most Important for Navigation)
      const totalInteractive = elementCounts.forms + elementCounts.buttons + elementCounts.inputs + elementCounts.links;
      console.log("🎯 INTERACTIVE SUMMARY:", {
        totalInteractiveElements: totalInteractive,
        formsWithInputs: `${elementCounts.forms} forms with ${elementCounts.inputs} inputs`,
        clickableElements: `${elementCounts.buttons} buttons + ${elementCounts.links} links`,
        focusableElements: elementCounts.focusableElements,
        navigationElements: elementCounts.navigation,
      });

      // 🔍 Detailed Element Analysis (Sample Data)
      if (domStructure.forms.length > 0) {
        console.log("📝 FORMS SAMPLE:", domStructure.forms.slice(0, 3).map(form => ({
          id: form.id,
          tagName: form.tagName,
          text: form.text?.substring(0, 50),
          isVisible: form.isVisible,
          position: `${form.position.x},${form.position.y}`,
          action: form.action,
          method: form.method,
        })));
      }

      if (domStructure.buttons.length > 0) {
        console.log("🔘 BUTTONS SAMPLE:", domStructure.buttons.slice(0, 3).map(button => ({
          id: button.id,
          text: button.text?.substring(0, 30),
          isVisible: button.isVisible,
          isClickable: button.isClickable,
          isDisabled: button.isDisabled,
          position: `${button.position.x},${button.position.y}`,
          zIndex: button.position.zIndex,
        })));
      }

      if (domStructure.inputs.length > 0) {
        console.log("📥 INPUTS SAMPLE:", domStructure.inputs.slice(0, 3).map(input => ({
          id: input.id,
          inputType: input.inputType,
          // ✅ FIXED: Use className instead of name (which doesn't exist on SimpleElement)
          className: input.className,
          value: input.value?.substring(0, 20),
          isRequired: input.isRequired,
          // ✅ FIXED: Use optional chaining since these properties don't exist on SimpleElement
          hasError: (input as InputElement).hasError,  // Type assertion for properties that may exist on extended types
          placeholder: (input as InputElement).placeholder?.substring(0, 30),
        })));
      }

      if (domStructure.links.length > 0) {
        console.log("🔗 LINKS SAMPLE:", domStructure.links.slice(0, 3).map(link => ({
          id: link.id,
          text: link.text?.substring(0, 30),
          href: link.href?.substring(0, 50),
          isExternal: link.isExternal,
          target: link.target,
        })));
      }

      if (domStructure.textContent && domStructure.textContent.length > 0) {
        const importantText = domStructure.textContent
          .filter(text => text.importance && text.importance > 0.7)
          .slice(0, 3);
        console.log("📄 IMPORTANT TEXT SAMPLE:", importantText.map(text => ({
          text: text.text?.substring(0, 50),
          importance: text.importance,
          section: text.section,
          isHeading: text.isHeading,
          wordCount: text.wordCount,
        })));
      }

      // ⚡ Performance & State Information
      console.log("⚡ PERFORMANCE & STATE:", {
        analysisTime: `${pageContext.loadTime}ms`,
        timeSinceAnalysis: `${Date.now() - pageContext.timestamp.getTime()}ms ago`,
        analyzerState: {
          isActive: isActive,
          isAnalyzing: isAnalyzing,
        },
        dataState: {
          historyEntries: analysisHistory.length,
          logEntries: analysisLog.length,
        },
      });

      // 🎯 Navigation Insights
      console.log("🎯 NAVIGATION INSIGHTS:", {
        pageComplexity: totalInteractive > 50 ? 'High' : totalInteractive > 20 ? 'Medium' : 'Low',
        hasErrors: elementCounts.errorElements > 0,
        hasModals: elementCounts.modals > 0,
        hasLoadingElements: elementCounts.loadingElements > 0,
        platformSpecific: pageContext.metadata.platform.isKnownPlatform,
        recommendedFocus: totalInteractive > 30 ? 'Forms and Buttons' : 'All Interactive Elements',
      });

      // 📋 Raw Page Context (Complete Object)
      console.log("📋 COMPLETE PAGE CONTEXT (Raw Data):", pageContext);

      console.log("✅ Comprehensive analysis complete!");
    });
  }, [
    pageAnalysis,
    currentPageContext,
    isActive,
    isAnalyzing,
    analysisHistory.length,
    analysisLog.length,
    logGroup,
  ]);

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

  const getAnalysisSummary = useCallback((): string => {
    if (!currentPageContext) {
      return "No analysis data available";
    }

    const textCount = currentPageContext.domStructure.textContent?.length || 0;
    const summary = `${currentPageContext.metadata.platform.name} | ${currentPageContext.metadata.pageType} | ${currentPageContext.domStructure.forms.length}F ${currentPageContext.domStructure.buttons.length}B ${currentPageContext.domStructure.inputs.length}I ${textCount}T | ${currentPageContext.loadTime}ms`;

    console.log(createLog("📋 Summary:"), summary);
    return summary;
  }, [currentPageContext, createLog]);

  return {
    // ✅ ENHANCED: Pass-through with enhanced handlers
    currentPageContext,
    isAnalyzing,
    isActive,
    analysisHistory,
    analysisLog,
    setActive,
    analyzeCurrentPage,
    clearHistory,
    clearLog,
    handlePageAnalyzed: enhancedHandlePageAnalyzed, // ✅ Enhanced with auto-logging
    handlePageChanged: enhancedHandlePageChanged,   // ✅ Enhanced with auto-logging

    // Debug logging functions
    logCurrentPage,
    logAnalysisHistory,
    logActivityLog,
    logAllData,
    logComprehensivePageData, // ✅ NEW: Comprehensive page data analysis
    logPageElements: () => {}, // Placeholder - implement if needed
    logPlatformInfo: () => {}, // Placeholder - implement if needed  
    logViewportInfo: () => {}, // Placeholder - implement if needed
    logPerformanceStats: () => {}, // Placeholder - implement if needed

    // Quick actions
    triggerAnalysisAndLog: async () => {
      if (!pageAnalysis) {
        console.warn("❌ PageAnalysis not available - cannot trigger analysis");
        return;
      }
      
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
    },
    toggleAnalyzerAndLog: () => {
      if (!pageAnalysis) {
        console.warn("❌ PageAnalysis not available - cannot toggle analyzer");
        return;
      }
      
      const newState = !isActive;
      setActive(newState);
      console.log(
        createLog(`🔧 PageAnalyzer ${newState ? "ENABLED" : "DISABLED"}`)
      );
    },
    clearAllAndLog: () => {
      console.log(createLog("🗑️ Clearing all analysis data..."));
      const beforeCounts = {
        history: analysisHistory.length,
        logs: analysisLog.length,
      };
      clearHistory();
      clearLog();
      console.log(createLog("✅ Data cleared"), beforeCounts);
    },

    // Utility functions
    exportAnalysisData,
    getAnalysisSummary,
  };
};