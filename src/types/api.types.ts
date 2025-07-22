// src/types/api.types.ts

import type { PageContext } from './page.types';
import type { UserProfile } from './user.types';
import type { NavigationStep, NavigationIntent, NavigationOptions, WorkflowInfo, IntentRecognitionResult } from './workflow.types';
import type { VisualInstruction } from './visual.types';
import type { Resource, DifficultyLevel } from './core.types';

// ====================================
// REQUEST/RESPONSE DTOs
// ====================================

export interface NavigationRequestDto {
  // User request
  message: string;
  intent?: NavigationIntent;
  
  // Context
  pageContext: PageContext;
  userProfile: UserProfile;
  sessionId: string;
  
  // Goal and workflow
  goal?: string;
  workflowId?: string;
  stepId?: string;
  
  // Options
  options: NavigationOptions;
  
  // Metadata
  timestamp: Date;
  userAgent: string;
  clientVersion: string;
}

export interface NavigationResponseDto {
  // Response content
  message: string;
  messageId: string;
  
  // Visual guidance
  visualInstructions: VisualInstruction[];
  
  // Step information
  currentStep: NavigationStep;
  workflow: WorkflowInfo;
  
  // Additional content
  content: ResponseContent;
  
  // Metadata
  metadata: ResponseMetadata;
  
  // Timing and performance
  timing: ResponseTiming;
}

// ====================================
// RESPONSE CONTENT TYPES
// ====================================

export interface ResponseContent {
  summary?: string;
  details?: string;
  images?: ImageContent[];
  videos?: VideoContent[];
  interactiveElements?: InteractiveElement[];
  relatedTopics?: RelatedTopic[];
  additionalResources?: Resource[];
}

export interface ImageContent {
  url: string;
  alt: string;
  caption?: string;
  type: 'screenshot' | 'diagram' | 'icon' | 'illustration';
}

export interface VideoContent {
  url: string;
  title: string;
  duration: number;
  thumbnail?: string;
}

export interface InteractiveElement {
  type: 'quiz' | 'demo' | 'simulator' | 'checklist';
  content: any;
  title: string;
  description: string;
}

export interface RelatedTopic {
  title: string;
  description: string;
  url?: string;
  workflowId?: string;
}

// ====================================
// METADATA AND ANALYSIS TYPES
// ====================================

export interface ResponseMetadata {
  aiModel: string;
  responseTime: number;
  confidence: number;
  
  intentRecognition: IntentRecognitionResult;
  pageAnalysis: PageAnalysisResult;
  
  personalizationFactors: PersonalizationFactor[];
  
  qualityScore: number;
  completeness: number;
  clarity: number;
  
  feedbackRequested: boolean;
  improvementSuggestions: string[];
}

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

export interface PersonalizationFactor {
  factor: string;
  value: any;
  impact: 'low' | 'medium' | 'high';
}

// ====================================
// TIMING AND PERFORMANCE TYPES
// ====================================

export interface ResponseTiming {
  requestReceived: Date;
  processingStarted: Date;
  processingCompleted: Date;
  responseSent: Date;
  
  domAnalysisTime: number;
  intentRecognitionTime: number;
  aiProcessingTime: number;
  visualGenerationTime: number;
  
  totalProcessingTime: number;
  
  cacheHit: boolean;
  optimizationsApplied: string[];
}