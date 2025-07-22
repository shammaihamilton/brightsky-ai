// src/types/visual.types.ts

import type { 
  FontSizeValue, 
  FontWeight, 
  TextAlign, 
  TextTransform, 
  DimensionValue, 
  SpacingValue, 
  DisplayType, 
  OverflowType, 
  BorderStyleType, 
  TimingFunction, 
  AnimationDirection, 
  AnimationFillMode, 
  AnimationPlayState, 
  Direction 
} from './core.types';

// ====================================
// VISUAL INSTRUCTION TYPES
// ====================================

export interface VisualInstruction {
  // Instruction identification
  instructionId: string;
  stepId: string;
  
  // Visual element type
  type: VisualInstructionType;
  
  // Target element
  elementSelector: string;
  elementInfo: TargetElementInfo;
  
  // Content and messaging
  content: VisualContent;
  
  // Positioning and layout
  positioning: VisualPositioning;
  
  // Styling and appearance
  styling: VisualStyling;
  
  // Behavior and interaction
  behavior: VisualBehavior;
  
  // Accessibility
  accessibility: VisualAccessibility;
  
  // Lifecycle
  lifecycle: VisualLifecycle;
}

export enum VisualInstructionType {
  // Basic highlighting
  HIGHLIGHT = 'highlight',
  GLOW = 'glow',
  
  // Directional guidance
  ARROW = 'arrow',
  LINE = 'line',
  PATH = 'path',
  
  // Information display
  TOOLTIP = 'tooltip',
  CALLOUT = 'callout',
  OVERLAY = 'overlay',
  
  // Interactive elements
  HOTSPOT = 'hotspot',
  PROGRESS_INDICATOR = 'progress_indicator',
  
  // Animation and effects
  PULSE = 'pulse',
  SHAKE = 'shake',
  ZOOM = 'zoom',
  
  // Complex guidance
  SPOTLIGHT = 'spotlight',
  GUIDED_TOUR = 'guided_tour',
  MINI_MAP = 'mini_map'
}

// ====================================
// TARGET ELEMENT TYPES
// ====================================

export interface TargetElementInfo {
  tagName: string;
  id?: string;
  className: string[];
  text?: string;
  
  isVisible: boolean;
  isEnabled: boolean;
  boundingRect: DOMRect;
  
  alternativeSelectors: string[];
  
  parentInfo?: Partial<TargetElementInfo>;
  nearbyElements?: NearbyElement[];
}

export interface NearbyElement {
  selector: string;
  relationship: 'sibling' | 'parent' | 'child' | 'adjacent';
  distance: number;
  description: string;
}

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
// VISUAL CONTENT TYPES
// ====================================

export interface VisualContent {
  title?: string;
  message: string;
  description?: string;
  
  steps?: string[];
  tips?: string[];
  warnings?: Warning[];
  
  html?: string;
  markdown?: string;
  
  translations?: Record<string, VisualContent>;
  
  isDynamic: boolean;
  updateFrequency?: number;
}

export interface Warning {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  consequences: string[];
  mitigation?: string;
}

// ====================================
// POSITIONING TYPES
// ====================================

export interface VisualPositioning {
  position: PositionStrategy;
  anchor: AnchorPoint;
  offset: PositionOffset;
  alignment: Alignment;
  responsive: ResponsivePositioning;
  collision: CollisionHandling;
}

export enum PositionStrategy {
  ABSOLUTE = 'absolute',
  RELATIVE = 'relative',
  FIXED = 'fixed',
  STICKY = 'sticky',
  FLOATING = 'floating',
  OVERLAY = 'overlay'
}

export enum AnchorPoint {
  TOP_LEFT = 'top_left',
  TOP_CENTER = 'top_center',
  TOP_RIGHT = 'top_right',
  CENTER_LEFT = 'center_left',
  CENTER = 'center',
  CENTER_RIGHT = 'center_right',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_CENTER = 'bottom_center',
  BOTTOM_RIGHT = 'bottom_right'
}

export interface PositionOffset {
  x: number;
  y: number;
  xPercent?: number;
  yPercent?: number;
}

export interface Alignment {
  horizontal: 'left' | 'center' | 'right' | 'auto';
  vertical: 'top' | 'middle' | 'bottom' | 'auto';
  preferredSide: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  fallbackSides: ('top' | 'bottom' | 'left' | 'right')[];
}

export interface ResponsivePositioning {
  breakpoints: PositionBreakpoint[];
  mobileStrategy: MobilePositionStrategy;
  viewportAware: boolean;
  scrollAware: boolean;
}

export interface PositionBreakpoint {
  minWidth?: number;
  maxWidth?: number;
  position: VisualPositioning;
}

export enum MobilePositionStrategy {
  BOTTOM_SHEET = 'bottom_sheet',
  FULL_SCREEN = 'full_screen',
  COMPACT = 'compact',
  ADAPTIVE = 'adaptive'
}

export interface CollisionHandling {
  detectCollisions: boolean;
  adjustmentStrategy: AdjustmentStrategy;
  flipOnCollision: boolean;
  flipOrder: ('top' | 'bottom' | 'left' | 'right')[];
  allowShrinking: boolean;
  minSize: { width: number; height: number; };
}

export enum AdjustmentStrategy {
  FLIP = 'flip',
  SHIFT = 'shift',
  RESIZE = 'resize',
  SCROLL = 'scroll',
  NONE = 'none'
}

// ====================================
// STYLING TYPES
// ====================================

export interface VisualStyling {
  colors: ColorScheme;
  typography: TypographyStyle;
  layout: LayoutStyle;
  effects: VisualEffects;
  theme: ThemeInfo;
  customCSS?: string;
  customClasses?: string[];
}

export interface ColorScheme {
  primary: string;
  secondary?: string;
  accent?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface?: string;
  text: string;
  textSecondary?: string;
  border?: string;
  shadow?: string;
  hover?: string;
  active?: string;
  focus?: string;
  opacity?: number;
}

export interface TypographyStyle {
  fontFamily?: string;
  fontSize: FontSizeValue;
  fontWeight?: FontWeight;
  lineHeight?: number;
  textAlign?: TextAlign;
  textDecoration?: string;
  textTransform?: TextTransform;
  letterSpacing?: number;
  wordSpacing?: number;
}

export interface LayoutStyle {
  width?: DimensionValue;
  height?: DimensionValue;
  maxWidth?: DimensionValue;
  maxHeight?: DimensionValue;
  minWidth?: DimensionValue;
  minHeight?: DimensionValue;
  padding?: SpacingValue;
  margin?: SpacingValue;
  border?: BorderStyle;
  borderRadius?: number;
  display?: DisplayType;
  overflow?: OverflowType;
  zIndex?: number;
}

export interface BorderStyle {
  width?: number;
  style?: BorderStyleType;
  color?: string;
}

export interface VisualEffects {
  boxShadow?: ShadowStyle;
  textShadow?: ShadowStyle;
  transform?: TransformStyle;
  filter?: FilterStyle;
  backdropFilter?: FilterStyle;
  transition?: TransitionStyle;
  animation?: AnimationStyle;
}

export interface ShadowStyle {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadRadius?: number;
  color: string;
  inset?: boolean;
}

export interface TransformStyle {
  translate?: { x?: number; y?: number; z?: number; };
  rotate?: { x?: number; y?: number; z?: number; };
  scale?: { x?: number; y?: number; z?: number; };
  skew?: { x?: number; y?: number; };
}

export interface FilterStyle {
  blur?: number;
  brightness?: number;
  contrast?: number;
  grayscale?: number;
  hueRotate?: number;
  invert?: number;
  opacity?: number;
  saturate?: number;
  sepia?: number;
}

export interface TransitionStyle {
  property: string | string[];
  duration: number;
  timingFunction?: TimingFunction;
  delay?: number;
}

export interface AnimationStyle {
  name: string;
  duration: number;
  timingFunction?: TimingFunction;
  delay?: number;
  iterationCount?: number | 'infinite';
  direction?: AnimationDirection;
  fillMode?: AnimationFillMode;
  playState?: AnimationPlayState;
}

export interface ThemeInfo {
  name: string;
  variant: 'light' | 'dark' | 'auto' | 'high-contrast';
  brand?: string;
  brandColors?: ColorScheme;
  highContrast: boolean;
  reducedMotion: boolean;
  customProperties?: Record<string, string>;
}

// ====================================
// BEHAVIOR TYPES
// ====================================

export interface VisualBehavior {
  showTrigger: ShowTrigger;
  hideTrigger: HideTrigger;
  timing: BehaviorTiming;
  interaction: InteractionBehavior;
  animation: AnimationBehavior;
  persistence: PersistenceBehavior;
  priority: number;
  layer: DisplayLayer;
}

export interface ShowTrigger {
  type: ShowTriggerType;
  delay?: number;
  condition?: string;
  dependencies?: string[];
}

export enum ShowTriggerType {
  IMMEDIATE = 'immediate',
  ON_STEP_START = 'on_step_start',
  ON_ELEMENT_VISIBLE = 'on_element_visible',
  ON_USER_ACTION = 'on_user_action',
  ON_PAGE_LOAD = 'on_page_load',
  ON_SCROLL = 'on_scroll',
  ON_HOVER = 'on_hover',
  ON_CLICK = 'on_click',
  MANUAL = 'manual'
}

export interface HideTrigger {
  type: HideTriggerType;
  delay?: number;
  condition?: string;
  timeout?: number;
}

export enum HideTriggerType {
  ON_CLICK = 'on_click',
  ON_STEP_COMPLETE = 'on_step_complete',
  ON_ELEMENT_INTERACT = 'on_element_interact',
  ON_TIMEOUT = 'on_timeout',
  ON_SCROLL_AWAY = 'on_scroll_away',
  ON_NEW_INSTRUCTION = 'on_new_instruction',
  MANUAL = 'manual',
  NEVER = 'never'
}

export interface BehaviorTiming {
  showDuration?: number;
  hideDuration?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  repeat?: boolean;
  repeatInterval?: number;
  maxRepeats?: number;
}

export interface InteractionBehavior {
  clickable: boolean;
  clickAction?: ClickAction;
  hoverable: boolean;
  hoverAction?: HoverAction;
  draggable: boolean;
  dragConstraints?: DragConstraints;
  dismissible: boolean;
  dismissAction?: DismissAction;
  focusable: boolean;
  focusAction?: FocusAction;
}

export interface ClickAction {
  type: 'dismiss' | 'next_step' | 'toggle_details' | 'open_link' | 'custom';
  target?: string;
  parameters?: Record<string, unknown>;
}

export interface HoverAction {
  type: 'show_details' | 'highlight_target' | 'show_preview' | 'custom';
  delay?: number;
  parameters?: Record<string, unknown>;
}

export interface DragConstraints {
  x?: { min?: number; max?: number; };
  y?: { min?: number; max?: number; };
  snapToGrid?: boolean;
  gridSize?: number;
}

export interface DismissAction {
  type: 'click_x' | 'click_outside' | 'escape_key' | 'timeout' | 'gesture';
  timeout?: number;
  confirmRequired?: boolean;
}

export interface FocusAction {
  type: 'highlight' | 'show_details' | 'activate' | 'custom';
  parameters?: Record<string, unknown>;
}

// ====================================
// ANIMATION TYPES
// ====================================

export interface AnimationBehavior {
  entryAnimation?: EntryAnimation;
  exitAnimation?: ExitAnimation;
  idleAnimation?: IdleAnimation;
  hoverAnimation?: InteractiveAnimation;
  clickAnimation?: InteractiveAnimation;
  focusAnimation?: InteractiveAnimation;
  attentionAnimation?: AttentionAnimation;
}

export interface EntryAnimation {
  type: EntryAnimationType;
  duration: number;
  delay?: number;
  easing?: TimingFunction;
  fromDirection?: Direction;
}

export enum EntryAnimationType {
  FADE_IN = 'fade_in',
  SLIDE_IN = 'slide_in',
  ZOOM_IN = 'zoom_in',
  BOUNCE_IN = 'bounce_in',
  SPRING_IN = 'spring_in',
  ROTATE_IN = 'rotate_in',
  ELASTIC_IN = 'elastic_in',
  NONE = 'none'
}

export interface ExitAnimation {
  type: ExitAnimationType;
  duration: number;
  delay?: number;
  easing?: TimingFunction;
  toDirection?: Direction;
}

export enum ExitAnimationType {
  FADE_OUT = 'fade_out',
  SLIDE_OUT = 'slide_out',
  ZOOM_OUT = 'zoom_out',
  BOUNCE_OUT = 'bounce_out',
  SPRING_OUT = 'spring_out',
  ROTATE_OUT = 'rotate_out',
  ELASTIC_OUT = 'elastic_out',
  NONE = 'none'
}

export interface IdleAnimation {
  type: IdleAnimationType;
  duration: number;
  intensity?: number;
  repeatDelay?: number;
}

export enum IdleAnimationType {
  PULSE = 'pulse',
  GLOW = 'glow',
  BREATHE = 'breathe',
  FLOAT = 'float',
  SWAY = 'sway',
  NONE = 'none'
}

export interface InteractiveAnimation {
  type: InteractiveAnimationType;
  duration: number;
  intensity?: number;
  reverseOnEnd?: boolean;
}

export enum InteractiveAnimationType {
  SCALE = 'scale',
  GLOW = 'glow',
  COLOR_SHIFT = 'color_shift',
  SHAKE = 'shake',
  BOUNCE = 'bounce',
  ROTATE = 'rotate',
  NONE = 'none'
}

export interface AttentionAnimation {
  type: AttentionAnimationType;
  duration: number;
  repeatCount?: number;
  intensity?: number;
  triggerCondition?: AttentionTrigger;
}

export enum AttentionAnimationType {
  SHAKE = 'shake',
  PULSE = 'pulse',
  BOUNCE = 'bounce',
  FLASH = 'flash',
  WOBBLE = 'wobble',
  TADA = 'tada',
  JELLO = 'jello',
  NONE = 'none'
}

export enum AttentionTrigger {
  IDLE_TOO_LONG = 'idle_too_long',
  WRONG_ACTION = 'wrong_action',
  CRITICAL_STEP = 'critical_step',
  USER_CONFUSED = 'user_confused',
  MANUAL = 'manual'
}

export interface PersistenceBehavior {
  persistAcrossPages: boolean;
  persistAcrossReloads: boolean;
  saveState: boolean;
  storageKey?: string;
  restoreOnReturn: boolean;
  restoreConditions?: string[];
}

export enum DisplayLayer {
  BACKGROUND = 'background',
  CONTENT = 'content',
  OVERLAY = 'overlay',
  MODAL = 'modal',
  TOOLTIP = 'tooltip',
  CRITICAL = 'critical'
}

// ====================================
// ACCESSIBILITY TYPES
// ====================================

export interface VisualAccessibility {
  ariaLabel?: string;
  ariaDescription?: string;
  ariaRole?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  
  tabIndex?: number;
  keyboardShortcut?: string;
  
  autoFocus?: boolean;
  focusTrapping?: boolean;
  restoreFocus?: boolean;
  
  highContrastColors?: ColorScheme;
  forcedColorsSupport?: boolean;
  
  respectReducedMotion?: boolean;
  alternativeAnimation?: AnimationBehavior;
  
  textAlternatives?: TextAlternative[];
  
  languageCode?: string;
  textDirection?: 'ltr' | 'rtl';
}

export interface TextAlternative {
  type: 'speech' | 'braille' | 'sign_language' | 'simplified';
  content: string;
  language?: string;
}

// ====================================
// LIFECYCLE TYPES
// ====================================

export interface VisualLifecycle {
  createdAt: Date;
  createdBy: string;
  
  currentState: VisualState;
  stateHistory: StateChange[];
  
  renderTime?: number;
  updateCount: number;
  
  viewCount: number;
  interactionCount: number;
  effectivenessScore?: number;
  
  cleanupConditions: CleanupCondition[];
  autoCleanup: boolean;
}

export enum VisualState {
  CREATED = 'created',
  SHOWING = 'showing',
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  UPDATING = 'updating',
  DISMISSING = 'dismissing',
  DISMISSED = 'dismissed',
  COMPLETED = 'completed',
  ERROR = 'error',
  DESTROYED = 'destroyed'
}

export interface StateChange {
  fromState: VisualState;
  toState: VisualState;
  timestamp: Date;
  reason: string;
  triggeredBy: 'user' | 'system' | 'timeout' | 'error';
}

export interface CleanupCondition {
  type: 'timeout' | 'step_complete' | 'page_change' | 'user_dismiss' | 'goal_achieved';
  parameters?: Record<string, unknown>;
  delay?: number;
}