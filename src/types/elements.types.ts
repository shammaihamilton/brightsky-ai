// src/types/elements.types.ts

// ====================================
// DOM STRUCTURE
// ====================================

export interface DOMStructure {
  // Interactive elements
  forms: FormElement[];
  buttons: ButtonElement[];
  inputs: InputElement[];
  links: LinkElement[];
  
  // Navigation elements
  navigation: NavigationElement[];
  menus: MenuElement[];
  
  // Content structure
  headings: HeadingElement[];
  paragraphs: ParagraphElement[];
  lists: ListElement[];
  
  // Media and visual elements
  images: ImageElement[];
  videos: VideoElement[];
  
  // Layout and containers
  containers: ContainerElement[];
  modals: ModalElement[];
  popups: PopupElement[];
  
  // Page state
  loadingElements: LoadingElement[];
  errorElements: ErrorElement[];
  
  // Accessibility
  landmarks: LandmarkElement[];
  focusableElements: FocusableElement[];
}

// ====================================
// BASE ELEMENT TYPES
// ====================================

export interface BaseElement {
  // Identification
  id: string;
  tagName: string;
  className: string[];
  
  // Content
  text?: string;
  ariaLabel?: string;
  title?: string;
  
  // Position and visibility
  position: ElementPosition;
  visibility: ElementVisibility;
  
  // Interaction
  interaction: ElementInteraction;
  
  // Context
  context: ElementContext;
  
  // Analysis
  purpose: ElementPurpose;
  confidence: number;
}

export interface ElementPosition {
  // Absolute position on page
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Relative to viewport
  viewportX: number;
  viewportY: number;
  
  // Z-index and layering
  zIndex: number;
  isOnTop: boolean;
  
  // Positioning context
  isFixed: boolean;
  isSticky: boolean;
  isAbsolute: boolean;
  
  // Scroll context
  scrollContainer?: string;
  offsetFromScroll: { x: number; y: number; };
}

export interface ElementVisibility {
  isVisible: boolean;
  isInViewport: boolean;
  opacity: number;
  isDisplayed: boolean;
  isObscured: boolean;
  percentageVisible: number;
}

export interface ElementInteraction {
  isClickable: boolean;
  isEditable: boolean;
  isDisabled: boolean;
  isFocusable: boolean;
  isRequired: boolean;
  
  // Event handlers
  hasClickHandler: boolean;
  hasKeyboardHandler: boolean;
  hasHoverEffects: boolean;
  
  // Form context
  isFormElement: boolean;
  formId?: string;
  fieldType?: string;
}

export interface ElementContext {
  // Hierarchy
  parentId?: string;
  childrenIds: string[];
  siblingIds: string[];
  
  // Semantic context
  section?: string;
  landmark?: string;
  role?: string;
  
  // Business context
  workflow?: string;
  step?: number;
  groupId?: string;
}

export interface ElementPurpose {
  // Primary purpose
  type: ElementType;
  
  // Specific actions
  action?: ElementAction;
  
  // Data collection
  dataType?: DataType;
  
  // Navigation
  destination?: string;
  
  // Business function
  businessFunction?: BusinessFunction;
}

// ====================================
// ELEMENT TYPE ENUMS
// ====================================

export enum ElementType {
  // Form elements
  TEXT_INPUT = 'text_input',
  EMAIL_INPUT = 'email_input',
  PASSWORD_INPUT = 'password_input',
  SEARCH_INPUT = 'search_input',
  NUMBER_INPUT = 'number_input',
  DATE_INPUT = 'date_input',
  FILE_INPUT = 'file_input',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  
  // Buttons
  SUBMIT_BUTTON = 'submit_button',
  CANCEL_BUTTON = 'cancel_button',
  DELETE_BUTTON = 'delete_button',
  EDIT_BUTTON = 'edit_button',
  SAVE_BUTTON = 'save_button',
  BACK_BUTTON = 'back_button',
  NEXT_BUTTON = 'next_button',
  MENU_BUTTON = 'menu_button',
  
  // Navigation
  MAIN_NAVIGATION = 'main_navigation',
  BREADCRUMB = 'breadcrumb',
  PAGINATION = 'pagination',
  TAB = 'tab',
  LINK = 'link',
  
  // Content
  HEADING = 'heading',
  PARAGRAPH = 'paragraph',
  LIST = 'list',
  TABLE = 'table',
  IMAGE = 'image',
  VIDEO = 'video',
  
  // Layout
  CONTAINER = 'container',
  SIDEBAR = 'sidebar',
  MODAL = 'modal',
  POPUP = 'popup',
  TOOLTIP = 'tooltip',
  
  // Status
  ERROR_MESSAGE = 'error_message',
  SUCCESS_MESSAGE = 'success_message',
  WARNING_MESSAGE = 'warning_message',
  LOADING_INDICATOR = 'loading_indicator',
  
  // Forms
  FORM = 'form',
  LOGIN_FORM = 'login_form',
  SIGNUP_FORM = 'signup_form',
  
  // Unknown
  UNKNOWN = 'unknown'
}

export enum ElementAction {
  // Account actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGNUP = 'signup',
  FORGOT_PASSWORD = 'forgot_password',
  
  // CRUD actions
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  
  // Navigation actions
  GO_BACK = 'go_back',
  GO_FORWARD = 'go_forward',
  GO_HOME = 'go_home',
  OPEN_MENU = 'open_menu',
  CLOSE_MODAL = 'close_modal',
  
  // Form actions
  SUBMIT_FORM = 'submit_form',
  RESET_FORM = 'reset_form',
  VALIDATE_FIELD = 'validate_field',
  
  // Data actions
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
  EXPORT = 'export',
  IMPORT = 'import',
  
  // Payment actions
  ADD_TO_CART = 'add_to_cart',
  CHECKOUT = 'checkout',
  PAY = 'pay',
  
  // Unknown
  UNKNOWN = 'unknown'
}

export enum DataType {
  // Personal data
  FIRST_NAME = 'first_name',
  LAST_NAME = 'last_name',
  FULL_NAME = 'full_name',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address',
  
  // Credentials
  USERNAME = 'username',
  PASSWORD = 'password',
  CONFIRM_PASSWORD = 'confirm_password',
  
  // Financial
  CREDIT_CARD = 'credit_card',
  CVV = 'cvv',
  EXPIRY_DATE = 'expiry_date',
  BILLING_ADDRESS = 'billing_address',
  
  // Technical
  API_KEY = 'api_key',
  TOKEN = 'token',
  URL = 'url',
  
  // Business
  COMPANY_NAME = 'company_name',
  JOB_TITLE = 'job_title',
  
  // Generic
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  
  // Unknown
  UNKNOWN = 'unknown'
}

export enum BusinessFunction {
  // Account management
  ACCOUNT_CREATION = 'account_creation',
  PROFILE_MANAGEMENT = 'profile_management',
  SETTINGS_CONFIGURATION = 'settings_configuration',
  
  // Security
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  TWO_FACTOR_AUTH = 'two_factor_auth',
  
  // Cloud services
  RESOURCE_CREATION = 'resource_creation',
  RESOURCE_MANAGEMENT = 'resource_management',
  BILLING_SETUP = 'billing_setup',
  
  // Data management
  DATA_UPLOAD = 'data_upload',
  DATA_EXPORT = 'data_export',
  BACKUP_RESTORE = 'backup_restore',
  
  // Communication
  MESSAGING = 'messaging',
  NOTIFICATIONS = 'notifications',
  
  // Unknown
  UNKNOWN = 'unknown'
}

// ====================================
// SPECIFIC ELEMENT INTERFACES
// ====================================

export interface FormElement extends BaseElement {
  action: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  enctype?: string;
  fields: InputElement[];
  submitButton?: ButtonElement;
  
  // Validation
  isValid: boolean;
  errors: FormError[];
  requiredFields: string[];
  
  // State
  isSubmitting: boolean;
  percentComplete: number;
  
  // Security
  hasCSRFToken: boolean;
  isSecure: boolean;
}

export interface FormError {
  fieldId: string;
  message: string;
  type: 'required' | 'format' | 'custom';
}

export interface InputElement extends BaseElement {
  // Input specifics
  inputType: string;
  name: string;
  value: string;
  placeholder?: string;
  
  // Validation
  isRequired: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  
  // State
  isFocused: boolean;
  hasError: boolean;
  errorMessage?: string;
  
  // Auto-completion
  autocomplete?: string;
  suggestions: string[];
}

export interface ButtonElement extends BaseElement {
  // Button specifics
  buttonType: 'submit' | 'button' | 'reset';
  
  // Visual state
  isPressed: boolean;
  isLoading: boolean;
  
  // Behavior
  opensModal: boolean;
  navigatesTo?: string;
  submitsForm: boolean;
  
  // Styling
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size: 'small' | 'medium' | 'large';
}

export interface LinkElement extends BaseElement {
  href: string;
  target: string;
  isExternal: boolean;
  isDownload: boolean;
  downloadFilename?: string;
}

export interface NavigationElement extends BaseElement {
  navigationItems: NavigationItem[];
  isMainNavigation: boolean;
  isBreadcrumb: boolean;
}

export interface NavigationItem {
  text: string;
  href?: string;
  isActive: boolean;
  hasSubMenu: boolean;
  subItems?: NavigationItem[];
}

export interface MenuElement extends BaseElement {
  menuItems: MenuItem[];
  isOpen: boolean;
  menuType: string;
}

export interface MenuItem {
  text: string;
  href?: string;
  action?: string;
  isDisabled: boolean;
  hasSubMenu: boolean;
  subItems?: MenuItem[];
}

export interface HeadingElement extends BaseElement {
  level: number;
  isPageTitle: boolean;
}

export interface ParagraphElement extends BaseElement {
  wordCount: number;
  hasLinks: boolean;
}

export interface ListElement extends BaseElement {
  listType: string;
  itemCount: number;
  isNested: boolean;
}

export interface ImageElement extends BaseElement {
  src: string;
  alt: string;
  isDecorative: boolean;
  isLoaded: boolean;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface VideoElement extends BaseElement {
  src: string;
  isPlaying: boolean;
  hasControls: boolean;
  isEmbedded: boolean;
}

export interface ContainerElement extends BaseElement {
  containerType: string;
  childCount: number;
  hasScrollableContent: boolean;
}

export interface ModalElement extends BaseElement {
  isOpen: boolean;
  isBlocking: boolean;
  hasCloseButton: boolean;
}

export interface PopupElement extends BaseElement {
  triggerElement?: string;
  isVisible: boolean;
}

export interface LoadingElement extends BaseElement {
  loadingType: string;
  isActive: boolean;
}

export interface ErrorElement extends BaseElement {
  errorType: string;
  errorMessage: string;
  relatedField?: string;
}

export interface LandmarkElement extends BaseElement {
  landmarkType: string;
  isUnique: boolean;
}

export interface FocusableElement extends BaseElement {
  tabIndex: number;
  isFocused: boolean;
  isFocusable: boolean;
}