// src/types/workflow.types.ts
import type { Warning, Note, DifficultyLevel } from './core.types';

// ====================================
// NAVIGATION STEP TYPES
// ====================================

export interface NavigationStep {
  stepId: string;
  stepNumber: number;
  stepName: string;
  
  instruction: string;
  explanation: string;
  
  targetElement: TargetElement;
  validation: StepValidation;
  
  alternatives: Alternative[];
  shortcuts: Shortcut[];
  
  warnings: Warning[];
  notes: Note[];
  
  estimatedTime: number;
  timeout?: number;
}

export interface TargetElement {
  selector: string;
  alternativeSelectors: string[];
  elementId?: string;
  
  action: TargetAction;
  
  inputValue?: string;
  inputType?: string;
  
  highlightStyle: HighlightStyle;
  animationType: AnimationType;
  
  accessibilityInstructions: string;
  keyboardShortcut?: string;
}

export enum TargetAction {
  CLICK = 'click',
  DOUBLE_CLICK = 'double_click',
  RIGHT_CLICK = 'right_click',
  HOVER = 'hover',
  
  TYPE = 'type',
  CLEAR = 'clear',
  SELECT = 'select',
  
  SCROLL_TO = 'scroll_to',
  SCROLL_DOWN = 'scroll_down',
  SCROLL_UP = 'scroll_up',
  
  FOCUS = 'focus',
  BLUR = 'blur',
  
  DRAG = 'drag',
  DROP = 'drop',
  
  WAIT = 'wait',
  VERIFY = 'verify'
}

export interface HighlightStyle {
  type: 'outline' | 'fill' | 'glow' | 'pulse' | 'bounce';
  color: string;
  secondaryColor?: string;
  thickness: number;
  opacity: number;
  duration: number;
}

export interface AnimationType {
  type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'shake';
  duration: number;
  delay: number;
  repeat: boolean;
}

// ====================================
// VALIDATION TYPES
// ====================================

export interface StepValidation {
  isRequired: boolean;
  validationRules: ValidationRule[];
  successCriteria: SuccessCriteria[];
  errorRecovery: ErrorRecovery[];
  timeoutBehavior: TimeoutBehavior;
}

export interface ValidationRule {
  type: 'presence' | 'format' | 'value' | 'custom';
  description: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface SuccessCriteria {
  type: 'element_present' | 'text_visible' | 'url_changed' | 'value_set' | 'custom';
  description: string;
  condition: string;
  timeout: number;
}

export interface ErrorRecovery {
  errorType: string;
  recoveryAction: string;
  alternativeSteps: string[];
  escalation?: string;
}

export interface TimeoutBehavior {
  action: 'retry' | 'skip' | 'ask_user' | 'abort';
  maxRetries?: number;
  retryDelay?: number;
  message?: string;
}

// ====================================
// WORKFLOW GUIDANCE TYPES
// ====================================

export interface Alternative {
  name: string;
  description: string;
  steps: string[];
  pros: string[];
  cons: string[];
  difficulty: 'easier' | 'same' | 'harder';
  timeEstimate: number;
}

export interface Shortcut {
  name: string;
  description: string;
  keys: string;
  condition?: string;
}

// ====================================
// WORKFLOW INFO TYPES
// ====================================

export interface WorkflowInfo {
  workflowId: string;
  workflowName: string;
  workflowType: WorkflowType;
  
  currentStepNumber: number;
  totalSteps: number;
  completedSteps: number;
  progress: number;
  
  estimatedTimeRemaining: number;
  totalEstimatedTime: number;
  timeElapsed: number;
  
  status: WorkflowStatus;
  canPause: boolean;
  canSkipStep: boolean;
  canGoBack: boolean;
  
  platform: string;
  service?: string;
  difficulty: DifficultyLevel;
  
  lastCheckpoint?: number;
  nextCheckpoint?: number;
}

export enum WorkflowType {
  ACCOUNT_SETUP = 'account_setup',
  RESOURCE_CREATION = 'resource_creation',
  CONFIGURATION = 'configuration',
  SECURITY_SETUP = 'security_setup',
  DATA_MIGRATION = 'data_migration',
  TROUBLESHOOTING = 'troubleshooting',
  LEARNING = 'learning',
  CUSTOM = 'custom'
}

export enum WorkflowStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  WAITING_FOR_USER = 'waiting_for_user',
  WAITING_FOR_SYSTEM = 'waiting_for_system',
  ERROR = 'error',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ====================================
// NAVIGATION INTENT TYPES
// ====================================

export interface NavigationIntent {
  // Primary intent
  type: IntentType;
  
  // Specific action
  action: string;
  
  // Target platform/service
  platform?: string;
  service?: string;
  
  // Parameters
  parameters: Record<string, unknown>;
  
  // Confidence
  confidence: number;
  alternatives: NavigationIntent[];
}

export enum IntentType {
  // Account management
  CREATE_ACCOUNT = 'create_account',
  LOGIN = 'login',
  SETUP_PROFILE = 'setup_profile',
  MANAGE_SETTINGS = 'manage_settings',
  
  // Resource management
  CREATE_RESOURCE = 'create_resource',
  CONFIGURE_RESOURCE = 'configure_resource',
  DELETE_RESOURCE = 'delete_resource',
  
  // Security
  SETUP_2FA = 'setup_2fa',
  MANAGE_KEYS = 'manage_keys',
  SETUP_SSL = 'setup_ssl',
  
  // Data operations
  UPLOAD_DATA = 'upload_data',
  BACKUP_DATA = 'backup_data',
  MIGRATE_DATA = 'migrate_data',
  
  // Learning
  LEARN_PLATFORM = 'learn_platform',
  GET_HELP = 'get_help',
  TROUBLESHOOT = 'troubleshoot',
  
  // Navigation
  FIND_FEATURE = 'find_feature',
  GO_TO_SECTION = 'go_to_section',
  
  // Unknown
  UNKNOWN = 'unknown'
}

export interface NavigationOptions {
  // Guidance preferences
  skipIntro: boolean;
  showAlternatives: boolean;
  includeWarnings: boolean;
  
  // Speed and automation
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  skipConfirmations: boolean;
  
  // Scope
  fullWorkflow: boolean;
  singleStep: boolean;
  exploreMode: boolean;
  
  // Learning
  explainConcepts: boolean;
  showBestPractices: boolean;
  includeShortcuts: boolean;
}

export interface IntentRecognitionResult {
  primaryIntent: NavigationIntent;
  alternativeIntents: NavigationIntent[];
  confidence: number;
  processingTime: number;
}