// src/types/page.types.ts

import type { DOMStructure } from './elements.types';

// ====================================
// PAGE CONTEXT TYPES
// ====================================

export interface PageContext {
  // Page identification
  url: string;
  title: string;
  domain: string;
  path: string;
  
  // DOM structure analysis
  domStructure: DOMStructure;
  
  // Viewport and scroll information
  viewport: ViewportInfo;
  
  // Page metadata
  metadata: PageMetadata;
  
  // Performance and timing
  loadTime: number;
  timestamp: Date;
}

export interface ViewportInfo {
  width: number;
  height: number;
  scrollPosition: {
    x: number;
    y: number;
  };
  scrollSize: {
    width: number;
    height: number;
  };
  devicePixelRatio: number;
  orientation: 'landscape' | 'portrait';
}

export interface PageMetadata {
  language: string;
  direction: 'ltr' | 'rtl';
  charset: string;
  keywords: string[];
  description: string;
  author?: string;
  lastModified?: Date;
  
  // Page type detection
  pageType: PageType;
  platform: PlatformInfo;
  
  // Security and privacy
  isSecure: boolean;
  hasTrackers: boolean;
  cookiePolicy?: string;
}

export enum PageType {
  LOGIN = 'login',
  SIGNUP = 'signup',
  DASHBOARD = 'dashboard',
  FORM = 'form',
  CHECKOUT = 'checkout',
  SETTINGS = 'settings',
  DOCUMENTATION = 'documentation',
  TUTORIAL = 'tutorial',
  ERROR = 'error',
  LOADING = 'loading',
  UNKNOWN = 'unknown'
  // Add more types as needed
  
}

export interface PlatformInfo {
  name: string;
  version?: string;
  framework?: string;
  isKnownPlatform: boolean;
}

// ====================================
// PAGE CHANGE TYPES
// ====================================

export interface PageChangeDto {
  newPageContext: PageContext;
  previousPageContext?: PageContext;
  
  navigationMethod: NavigationMethod;
  sessionId: string;
  
  continueWorkflow: boolean;
  workflowId?: string;
  expectedStep?: string;
  
  timestamp: Date;
  timeSincePrevious: number;
}

export enum NavigationMethod {
  CLICK = 'click',
  FORM_SUBMIT = 'form_submit',
  URL_CHANGE = 'url_change',
  BROWSER_NAV = 'browser_nav',
  REDIRECT = 'redirect',
  POPUP = 'popup',
  NEW_TAB = 'new_tab',
  UNKNOWN = 'unknown'
}

// ====================================
// PAGE ANALYSIS RESULTS
// ====================================

export interface PageAnalysisResult {
  elementsFound: number;
  pageComplexity: PageComplexity;
  analysisTime: number;
  issuesFound: PageIssue[];
}

export enum PageComplexity {
  VERY_SIMPLE = 'very_simple',
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex',
  VERY_COMPLEX = 'very_complex'
}

export interface PageIssue {
  type: 'accessibility' | 'usability' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  suggestion?: string;
}