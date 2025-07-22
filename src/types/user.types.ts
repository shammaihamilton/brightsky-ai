// src/types/user.types.ts

import type { TechnicalLevel, ExperienceLevel, FontSize } from './core.types';

// ====================================
// USER PROFILE
// ====================================

export interface UserProfile {
  // Identity
  userId?: string;
  sessionId: string;
  
  // Language and localization
  language: string;
  region: string;
  timezone: string;
  
  // Technical expertise
  technicalLevel: TechnicalLevel;
  
  // Platform experience
  platformExperience: PlatformExperience;
  
  // Accessibility needs
  accessibility: AccessibilityNeeds;
  
  // Guidance preferences
  preferences: GuidancePreferences;
  
  // Learning style
  learningStyle: LearningStyle;
  
  // Context and history
  context: UserContext;
}

// ====================================
// PLATFORM EXPERIENCE
// ====================================

export interface PlatformExperience {
  aws: ExperienceLevel;
  azure: ExperienceLevel;
  googleCloud: ExperienceLevel;
  github: ExperienceLevel;
  docker: ExperienceLevel;
  kubernetes: ExperienceLevel;
  databases: DatabaseExperience;
  webDevelopment: WebDevExperience;
}

export interface DatabaseExperience {
  postgresql: ExperienceLevel;
  mysql: ExperienceLevel;
  mongodb: ExperienceLevel;
  redis: ExperienceLevel;
}

export interface WebDevExperience {
  html: ExperienceLevel;
  css: ExperienceLevel;
  javascript: ExperienceLevel;
  react: ExperienceLevel;
  nodejs: ExperienceLevel;
}

// ====================================
// ACCESSIBILITY
// ====================================

export interface AccessibilityNeeds {
  // Screen reader
  screenReader: boolean;
  screenReaderType?: 'NVDA' | 'JAWS' | 'VoiceOver' | 'TalkBack';
  
  // Visual
  visualImpairment: boolean;
  colorBlindness: boolean;
  colorBlindnessType?: 'protanopia' | 'deuteranopia' | 'tritanopia';
  highContrast: boolean;
  fontSize: FontSize;
  
  // Motor
  motorImpairment: boolean;
  keyboardOnly: boolean;
  needsLargeClickTargets: boolean;
  
  // Cognitive
  cognitiveSupport: boolean;
  needsSimpleLanguage: boolean;
  needsExtraTime: boolean;
  
  // Attention
  reducedMotion: boolean;
  reducedAnimations: boolean;
  focusAssistance: boolean;
}

// ====================================
// GUIDANCE PREFERENCES
// ====================================

export interface GuidancePreferences {
  // Visual guidance style
  visualGuidanceStyle: VisualGuidanceStyle;
  
  // Explanation detail level
  explanationLevel: ExplanationLevel;
  
  // Animation and timing
  animationSpeed: AnimationSpeed;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  
  // Language and tone
  communicationStyle: CommunicationStyle;
  includeWarnings: boolean;
  includeAlternatives: boolean;
  
  // Learning features
  showTooltips: boolean;
  showKeyboardShortcuts: boolean;
  showBestPractices: boolean;
  
  // Privacy
  saveProgress: boolean;
  shareUsageData: boolean;
}

export enum VisualGuidanceStyle {
  HIGHLIGHTS_ONLY = 'highlights_only',
  ARROWS_ONLY = 'arrows_only',
  HIGHLIGHTS_AND_ARROWS = 'highlights_and_arrows',
  OVERLAYS = 'overlays',
  MINIMAL = 'minimal'
}

export enum ExplanationLevel {
  MINIMAL = 'minimal',
  CONCISE = 'concise',
  DETAILED = 'detailed',
  COMPREHENSIVE = 'comprehensive',
  EDUCATIONAL = 'educational'
}

export enum AnimationSpeed {
  NONE = 'none',
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast'
}

export enum CommunicationStyle {
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
  DIRECT = 'direct',
  ENCOURAGING = 'encouraging',
  HUMOROUS = 'humorous'
}

// ====================================
// LEARNING STYLE
// ====================================

export interface LearningStyle {
  preferredMethod: LearningMethod;
  processingStyle: ProcessingStyle;
  preferredPace: LearningPace;
  feedbackStyle: FeedbackStyle;
}

export enum LearningMethod {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING = 'reading',
  MIXED = 'mixed'
}

export enum ProcessingStyle {
  SEQUENTIAL = 'sequential',
  GLOBAL = 'global',
  ANALYTICAL = 'analytical',
  INTUITIVE = 'intuitive'
}

export enum LearningPace {
  VERY_SLOW = 'very_slow',
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast',
  VERY_FAST = 'very_fast'
}

export enum FeedbackStyle {
  IMMEDIATE = 'immediate',
  MILESTONE = 'milestone',
  COMPLETION = 'completion',
  ON_REQUEST = 'on_request'
}

// ====================================
// USER CONTEXT AND HISTORY
// ====================================

export interface UserContext {
  // Current session
  currentGoal?: string;
  currentWorkflow?: string;
  startTime: Date;
  
  // History
  completedWorkflows: string[];
  commonMistakes: string[];
  preferredPaths: PreferredPath[];
  
  // Progress tracking
  skillProgress: SkillProgress;
  platformProgress: PlatformProgress;
  
  // Behavioral patterns
  usagePatterns: UsagePattern[];
  
  // Current state
  frustrationLevel: FrustrationLevel;
  confidenceLevel: ConfidenceLevel;
  attentionLevel: AttentionLevel;
}

export interface PreferredPath {
  workflow: string;
  steps: string[];
  alternatives: string[];
  timeToComplete: number;
}

export interface SkillProgress {
  basicNavigation: number;
  formFilling: number;
  accountSetup: number;
  cloudServices: number;
  security: number;
  troubleshooting: number;
}

export interface PlatformProgress {
  aws: PlatformSkillProgress;
  azure: PlatformSkillProgress;
  googleCloud: PlatformSkillProgress;
}

export interface PlatformSkillProgress {
  accountSetup: boolean;
  basicNavigation: boolean;
  resourceCreation: boolean;
  billing: boolean;
  security: boolean;
  advanced: boolean;
}

export interface UsagePattern {
  pattern: string;
  frequency: number;
  efficiency: number;
  lastSeen: Date;
}

export enum FrustrationLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum ConfidenceLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum AttentionLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}