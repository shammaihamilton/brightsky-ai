// src/types/index.ts

// ====================================
// MAIN TYPES INDEX
// Re-exports all navigation-related types for convenient importing
// ====================================

// Core types and utilities
export * from './core.types';

// Page context and analysis
// export * from './page.types';

// DOM elements and interactions  
export * from './elements.types';

// User profiles and preferences
export * from './user.types';

// Workflows and navigation steps
export * from './workflow.types';

// Visual instructions and styling
// export * from './visual.types';

// API requests and responses
export * from './api.types';

// ====================================
// CONVENIENCE TYPE EXPORTS
// Commonly used type combinations for easier importing
// ====================================

// Main request/response types
export type {
  NavigationRequestDto,
  NavigationResponseDto
} from './api.types';

// Core context types


// Element types for DOM analysis
export type {
  BaseElement,
  FormElement,
  InputElement,
  ButtonElement,
  DOMStructure
} from './elements.types';

// ====================================
// NAMESPACE EXPORTS
// For cases where you want to use types with namespacing
// ====================================

import * as CoreTypes from './core.types';
import * as PageTypes from './page.types';
import * as ElementTypes from './elements.types';
import * as UserTypes from './user.types';
import * as WorkflowTypes from './workflow.types';
import * as VisualTypes from './visual.types';
import * as ApiTypes from './api.types';

export {
  CoreTypes,
  PageTypes,
  ElementTypes,
  UserTypes,
  WorkflowTypes,
  VisualTypes,
  ApiTypes
};

// ====================================
// USAGE EXAMPLES:
// ====================================

/**
 * Individual imports:
 * import { PageContext, UserProfile } from '@/types';
 * import { NavigationRequestDto } from '@/types/api.types';
 * import { ElementType, BaseElement } from '@/types/elements.types';
 * 
 * Namespace imports:
 * import { UserTypes, WorkflowTypes } from '@/types';
 * const level: UserTypes.TechnicalLevel = 'beginner';
 * const status: WorkflowTypes.WorkflowStatus = 'in_progress';
 * 
 * Wildcard import:
 * import * as NavigationTypes from '@/types';
 * const context: NavigationTypes.PageContext = { ... };
 */