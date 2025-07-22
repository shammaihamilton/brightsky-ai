// src/components/PageAnalyzer/index.tsx
// ✅ SIMPLIFIED: Only DOMAnalyzer + MutationObserver

import React, { useEffect, useRef, useCallback } from "react";
import { DOMAnalyzer } from "./analyzers/DOMAnalyzer";
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
  analysisInterval?: number;
}

export const PageAnalyzer: React.FC<PageAnalyzerProps> = ({
  isActive,
  onPageAnalyzed,
  onPageChanged,
  analysisInterval = 2000,
}) => {
  const previousContextRef = useRef<PageContext | null>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mutationObserverRef = useRef<CustomMutationObserver | null>(null);

  // ✅ SIMPLIFIED: Only one analyzer needed
  const domAnalyzer = useRef(new DOMAnalyzer());

  /**
   * ✅ SIMPLIFIED: Main analysis function
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

        // 2. ✅ FAST: Single analyzer does everything
        const domStructure = await domAnalyzer.current.analyzePage(document);

        // 3. Viewport information
        const orientation: ViewportInfo["orientation"] =
          window.innerWidth > window.innerHeight ? "landscape" : "portrait";

        const viewport: ViewportInfo = {
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

        // 4. ✅ SIMPLIFIED: Basic metadata
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
          platform: detectPlatform(url, document), // ✅ MOVED: Inline platform detection
          isSecure: url.startsWith("https://"),
          hasTrackers: detectTrackers(document),
        };

        // 5. Create page context
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
        ) > 0 ||
        Math.abs(
          previousContext.domStructure.buttons.length -
            newContext.domStructure.buttons.length
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
   * ✅ IMPROVED: Setup mutation observer with better filtering
   */
  const setupMutationObserver = useCallback(() => {
    if (!isActive) return;

    mutationObserverRef.current = new CustomMutationObserver({
      onMutation: (mutations) => {
        // ✅ SMART: Only re-analyze if there are significant changes
        const hasSignificantChanges = mutations.some((mutation) => {
          if (mutation.type === "childList") {
            // Check for new interactive elements
            const addedElements = Array.from(mutation.addedNodes).filter(
              (node) => node.nodeType === Node.ELEMENT_NODE
            ) as Element[];

            return addedElements.some((element) => {
              const tagName = element.tagName?.toLowerCase();
              return (
                ["form", "button", "input", "textarea", "select", "a"].includes(
                  tagName
                ) ||
                element.getAttribute("role") === "button" ||
                element.querySelector(
                  "form, button, input, textarea, select, a"
                )
              );
            });
          }

          if (mutation.type === "attributes") {
            const attrName = mutation.attributeName;
            return ["style", "hidden", "disabled", "class"].includes(
              attrName || ""
            );
          }

          return false;
        });

        if (hasSignificantChanges) {
          // Clear existing timeout
          if (analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current);
          }

          // Debounced re-analysis
          analysisTimeoutRef.current = setTimeout(async () => {
            const pageContext = await performPageAnalysis();
            if (pageContext) {
              handlePageChange(pageContext);
            }
          }, 750); // Wait 750ms after last significant change
        }
      },
      options: {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "id", "style", "hidden", "disabled"],
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

  return null;
};

// ✅ HELPER FUNCTIONS: Moved to the right place (bottom of file)

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
  const trackerSelectors = [
    'script[src*="google-analytics"]',
    'script[src*="gtag"]',
    'script[src*="facebook.net"]',
    'script[src*="doubleclick"]',
  ];

  return trackerSelectors.some((selector) => document.querySelector(selector));
}

// ✅ MOVED: Platform detection inline (since PlatformDetector is not used)
function detectPlatform(url: string, document: Document) {
  const hostname = new URL(url).hostname.toLowerCase();
  const title = document.title.toLowerCase();

  // AWS Detection
  if (
    hostname.includes("aws.amazon.com") ||
    hostname.includes("console.aws.amazon.com") ||
    title.includes("aws")
  ) {
    return { name: "AWS", isKnownPlatform: true };
  }

  // Azure Detection
  if (
    hostname.includes("portal.azure.com") ||
    hostname.includes("azure.microsoft.com") ||
    title.includes("azure")
  ) {
    return { name: "Azure", isKnownPlatform: true };
  }

  // Google Cloud Detection
  if (
    hostname.includes("console.cloud.google.com") ||
    hostname.includes("cloud.google.com") ||
    title.includes("google cloud")
  ) {
    return { name: "Google Cloud", isKnownPlatform: true };
  }

  // GitHub Detection
  if (hostname.includes("github.com") || title.includes("github")) {
    return { name: "GitHub", isKnownPlatform: true };
  }

  // Generic detection
  const commonPlatforms = [
    { keywords: ["vercel"], name: "Vercel" },
    { keywords: ["netlify"], name: "Netlify" },
    { keywords: ["heroku"], name: "Heroku" },
    { keywords: ["digitalocean"], name: "DigitalOcean" },
  ];

  for (const platform of commonPlatforms) {
    if (
      platform.keywords.some(
        (keyword) => hostname.includes(keyword) || title.includes(keyword)
      )
    ) {
      return { name: platform.name, isKnownPlatform: true };
    }
  }

  return { name: "Unknown", isKnownPlatform: false };
}

export default PageAnalyzer;
