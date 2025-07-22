// src/components/PageAnalyzer/index.tsx
import React, { useEffect, useRef, useCallback } from "react";
// Note: PageAnalyzer no longer uses usePageAnalysis - it's a pure component
import { DOMAnalyzer } from "./analyzers/DOMAnalyzer";
import { FormAnalyzer } from "./analyzers/FormAnalyzer";
import { ButtonAnalyzer } from "./analyzers/ButtonAnalyzer";
import { PlatformDetector } from "./analyzers/PlatformDetector";
import { MutationObserver as CustomMutationObserver } from "./observers/MutationObserver";
import type {
  PageContext,
  PageMetadata,
  PageType,
  ViewportInfo,
} from "../../types/page.types";

interface PageAnalyzerProps {
  isActive: boolean;
  onPageAnalyzed: (pageContext: PageContext) => void;
  onPageChanged: (
    newContext: PageContext,
    previousContext?: PageContext
  ) => void;
  analysisInterval?: number; // ms between analyses
}

export const PageAnalyzer: React.FC<PageAnalyzerProps> = ({
  isActive,
  onPageAnalyzed,
  onPageChanged,
  analysisInterval = 2000, // Default: analyze every 2 seconds
}) => {
  const previousContextRef = useRef<PageContext | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mutationObserverRef = useRef<CustomMutationObserver | null>(null);

  // Initialize analyzers
  const domAnalyzer = useRef(new DOMAnalyzer());
  const formAnalyzer = useRef(new FormAnalyzer());
  const buttonAnalyzer = useRef(new ButtonAnalyzer());
  const platformDetector = useRef(new PlatformDetector());


  /**
   * Main analysis function that orchestrates all analyzers
   */
  const performPageAnalysis =
    useCallback(async (): Promise<PageContext | null> => {
      if (!isActive) return null;

      try {
        const startTime = Date.now();

        // 1. Basic page information
        const url = window.location.href;
        const title = document.title;
        const domain = window.location.hostname;
        const path = window.location.pathname;

        // 2. Detect platform (AWS, Azure, GitHub, etc.)
        const platform = await platformDetector.current.detectPlatform(
          url,
          document
        );
        // 3. Analyze DOM structure
        const domStructure = await domAnalyzer.current.analyzePage(document);

        // 4. Analyze forms specifically
        const forms = await formAnalyzer.current.analyzeForms(document);
        domStructure.forms = forms;

        // 5. Analyze buttons specifically
        const buttons = await buttonAnalyzer.current.analyzeButtons(document);
        domStructure.buttons = buttons;

        // 6. Get viewport information
        const orientation: ViewportInfo["orientation"] =
          window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollPosition: {
            x: window.scrollX,
            y: window.scrollY,
          },
          scrollSize: {
            width: document.documentElement.scrollWidth,
            height: document.documentElement.scrollHeight,
          },
          devicePixelRatio: window.devicePixelRatio,
          orientation,
        };

        // 7. Extract metadata
        const metadata: PageMetadata = {
          language: document.documentElement.lang || "en",
          direction: getComputedStyle(document.documentElement).direction as
            | "ltr"
            | "rtl",
          charset: document.characterSet || "UTF-8",
          keywords:
            extractMetaContent("keywords")
              ?.split(",")
              .map((k) => k.trim()) || [],
          description: extractMetaContent("description") || "",
          author: extractMetaContent("author"),
          lastModified: document.lastModified
            ? new Date(document.lastModified)
            : undefined,
          pageType: detectPageType(document, url) as PageType,
          platform: platform,
          isSecure: url.startsWith("https://"),
          hasTrackers: detectTrackers(document),
        };

        // 8. Create complete page context
        const pageContext: PageContext = {
          url,
          title,
          domain,
          path,
          domStructure,
          viewport,
          metadata,
          loadTime: Date.now() - startTime,
          timestamp: new Date(),
        };

        return pageContext;
      } catch (error) {
        console.error("PageAnalyzer: Error during analysis:", error);
        return null;
      }
    }, [isActive]);

  /**
   * Handle page changes and trigger appropriate callbacks
   */
  const handlePageChange = useCallback(
    (newContext: PageContext) => {
      const previousContext = previousContextRef.current;

      // Check if this is a significant change
      const isSignificantChange =
        !previousContext ||
        previousContext.url !== newContext.url ||
        previousContext.title !== newContext.title ||
        Math.abs(
          previousContext.domStructure.forms.length -
            newContext.domStructure.forms.length
        ) > 0;

      if (isSignificantChange) {
        onPageChanged(newContext, previousContext || undefined);
      }

      onPageAnalyzed(newContext);
      previousContextRef.current = newContext;
    },
    [onPageAnalyzed, onPageChanged]
  );

  /**
   * Start continuous analysis
   */
  const startAnalysis = useCallback(() => {
    if (!isActive) return;

    const analyze = async () => {
      const pageContext = await performPageAnalysis();
      if (pageContext) {
        handlePageChange(pageContext);
      }

      // Schedule next analysis
      analysisTimeoutRef.current = setTimeout(analyze, analysisInterval);
    };

    // Initial analysis
    analyze();
  }, [isActive, performPageAnalysis, handlePageChange, analysisInterval]);

  /**
   * Stop analysis and cleanup
   */
  const stopAnalysis = useCallback(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
      analysisTimeoutRef.current = null;
    }

    if (mutationObserverRef.current) {
      mutationObserverRef.current.disconnect();
      mutationObserverRef.current = null;
    }
  }, []);

  /**
   * Setup mutation observer for real-time changes
   */
  const setupMutationObserver = useCallback(() => {
    if (!isActive) return;

    mutationObserverRef.current = new CustomMutationObserver({
      onMutation: (mutations) => {
        // Debounced analysis on DOM changes
        if (analysisTimeoutRef.current) {
          clearTimeout(analysisTimeoutRef.current);
        }

        analysisTimeoutRef.current = setTimeout(async () => {
          const pageContext = await performPageAnalysis();
          if (pageContext) {
            handlePageChange(pageContext);
          }
        }, 500); // Wait 500ms after last mutation
      },
      options: {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "id", "data-*"],
      },
    });

    mutationObserverRef.current.observe(document.body);
  }, [isActive, performPageAnalysis, handlePageChange]);

  // Effects
  useEffect(() => {
    if (isActive) {
      startAnalysis();
      setupMutationObserver();
    } else {
      stopAnalysis();
    }

    return () => {
      stopAnalysis();
    };
  }, [isActive, startAnalysis, stopAnalysis, setupMutationObserver]);

  // Handle URL changes (SPA navigation)
  useEffect(() => {
    const handlePopState = () => {
      if (isActive) {
        setTimeout(async () => {
          const pageContext = await performPageAnalysis();
          if (pageContext) {
            handlePageChange(pageContext);
          }
        }, 100); // Small delay to let SPA update
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isActive, performPageAnalysis, handlePageChange]);

  // This component doesn't render anything visible
  return null;
};

// Helper functions
function extractMetaContent(name: string): string | undefined {
  const meta = document.querySelector(
    `meta[name="${name}"], meta[property="${name}"]`
  );
  return meta?.getAttribute("content") || undefined;
}

function detectPageType(document: Document, url: string): string {
  const path = url.toLowerCase();
  const title = document.title.toLowerCase();

  if (
    path.includes("login") ||
    title.includes("login") ||
    title.includes("sign in")
  ) {
    return "login";
  }
  if (
    path.includes("signup") ||
    path.includes("register") ||
    title.includes("sign up")
  ) {
    return "signup";
  }
  if (path.includes("dashboard") || title.includes("dashboard")) {
    return "dashboard";
  }
  if (path.includes("settings") || title.includes("settings")) {
    return "settings";
  }
  if (document.querySelector("form")) {
    return "form";
  }

  return "unknown";
}

function detectTrackers(document: Document): boolean {
  // Simple tracker detection
  const trackerSelectors = [
    'script[src*="google-analytics"]',
    'script[src*="gtag"]',
    'script[src*="facebook.net"]',
    'script[src*="doubleclick"]',
  ];

  return trackerSelectors.some((selector) => document.querySelector(selector));
}

export default PageAnalyzer;
