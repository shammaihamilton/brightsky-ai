// src/types/elements.types.ts
// ✅ ENHANCED: Added text content support + Z-index for layering

export interface DOMStructure {
  // Interactive elements
  forms: SimpleElement[];
  buttons: SimpleElement[];
  inputs: SimpleElement[];
  links: SimpleElement[];
  
  // Navigation elements
  navigation: SimpleElement[];
  menus: SimpleElement[];
  
  // Content structure
  headings: SimpleElement[];
  paragraphs: SimpleElement[];
  lists: SimpleElement[];
  
  // Media and visual elements
  images: SimpleElement[];
  videos: SimpleElement[];
  
  // Layout and containers
  containers: SimpleElement[];
  modals: SimpleElement[];
  popups: SimpleElement[];
  
  // Page state
  loadingElements: SimpleElement[];
  errorElements: SimpleElement[];
  
  // Accessibility
  landmarks: SimpleElement[];
  focusableElements: SimpleElement[];
  
  // ✅ NEW: Text content
  textContent?: SimpleElement[]; // All readable text on the page
}

export interface SimpleElement {
  // Essential identification
  id: string;
  tagName: string;
  text?: string;
  className?: string;
  
  // ✅ ENHANCED: Position with layering info
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;        // ✅ NEW: Z-index for layering
    isOnTop?: boolean;     // ✅ NEW: Is this the topmost element at this position?
    isFixed?: boolean;     // ✅ NEW: CSS position: fixed
    isSticky?: boolean;    // ✅ NEW: CSS position: sticky
    isAbsolute?: boolean;  // ✅ NEW: CSS position: absolute
  };
  
  // Essential properties
  isVisible: boolean;
  isClickable: boolean;
  isDisabled?: boolean;
  
  // Accessibility basics
  ariaLabel?: string;
  role?: string;
  
  // Type-specific properties (optional)
  href?: string;
  src?: string;
  inputType?: string;
  isRequired?: boolean;
  value?: string;
  action?: string;
  method?: string;
  level?: number;
  alt?: string;
  target?: string;
  isExternal?: boolean;
  
  // ✅ NEW: Text-specific properties
  wordCount?: number;
  hasLinks?: boolean;
  isHeading?: boolean;
  isParagraph?: boolean;
  isList?: boolean;
  isLabel?: boolean;
  section?: string;
  importance?: number;
  
  // ✅ NEW: Layer-specific properties
  layerType?: LayerType;     // What kind of layer is this?
  blocksInteraction?: boolean; // Does this block clicks to elements below?
  
  // Optional
  confidence?: number;
}

// ✅ NEW: Layer classification
export enum LayerType {
  BACKGROUND = 'background',     // z-index < 1
  CONTENT = 'content',          // z-index 1-99
  NAVIGATION = 'navigation',    // z-index 100-999
  DROPDOWN = 'dropdown',        // z-index 1000-9999
  MODAL = 'modal',             // z-index 10000-99999
  TOOLTIP = 'tooltip',         // z-index 100000-999999
  OVERLAY = 'overlay',         // z-index 1000000+
  UNKNOWN = 'unknown'
}

// Keep your existing enhanced interfaces
export interface FormElement extends SimpleElement {
  action: string;
  method: string;
  fields?: SimpleElement[];
  isValid?: boolean;
  isSubmitting?: boolean;
}

export interface InputElement extends SimpleElement {
  inputType: string;
  name?: string;
  value?: string;
  placeholder?: string;
  isRequired: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export interface LinkElement extends SimpleElement {
  href: string;
  target?: string;
  isExternal: boolean;
  isDownload?: boolean;
}

export interface ImageElement extends SimpleElement {
  src: string;
  alt: string;
  isLoaded?: boolean;
  dimensions?: { width: number; height: number; };
}