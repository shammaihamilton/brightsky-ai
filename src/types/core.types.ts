// src/types/core.types.ts

// ====================================
// SHARED UTILITY TYPES
// ====================================

export interface DOMRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ====================================
// CORE ENUMS
// ====================================

export enum DifficultyLevel {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
  EXPERT = 'expert'
}

export enum ExperienceLevel {
  NEVER_USED = 'never_used',
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum TechnicalLevel {
  COMPLETE_BEGINNER = 'complete_beginner',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
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
// SHARED INTERFACES
// ====================================

export interface Warning {
  type: WarningType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  consequences: string[];
  mitigation?: string;
}

export enum WarningType {
  SECURITY = 'security',
  COST = 'cost',
  DATA_LOSS = 'data_loss',
  IRREVERSIBLE = 'irreversible',
  PERFORMANCE = 'performance',
  COMPATIBILITY = 'compatibility',
  PRIVACY = 'privacy',
  TIME_CONSUMING = 'time_consuming'
}

export interface Note {
  type: 'tip' | 'info' | 'best_practice' | 'advanced' | 'troubleshooting';
  message: string;
  importance: 'low' | 'medium' | 'high';
  learnMore?: string;
}

export interface Resource {
  title: string;
  type: 'documentation' | 'tutorial' | 'video' | 'blog_post' | 'tool';
  url: string;
  description: string;
  difficulty: DifficultyLevel;
}

// ====================================
// COMMON VALUE TYPES
// ====================================

export type FontSizeValue = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 'normal' | 'bold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize';
export type DimensionValue = number | string | 'auto' | 'fit-content' | 'max-content';
export type SpacingValue = number | { top?: number; right?: number; bottom?: number; left?: number; };
export type DisplayType = 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none';
export type OverflowType = 'visible' | 'hidden' | 'scroll' | 'auto';
export type BorderStyleType = 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
export type TimingFunction = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | string;
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type AnimationFillMode = 'none' | 'forwards' | 'backwards' | 'both';
export type AnimationPlayState = 'paused' | 'running';
export type Direction = 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';