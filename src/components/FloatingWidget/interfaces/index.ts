export interface Position {
  x: number;
  y: number;
}

export interface ButtonSize {
  size: "small" | "medium" | "large";
}

export interface WidgetDimensions {
  width: number;
  height: number;
}

export interface IPositionService {
  getPosition(): Position;
  setPosition(position: Position): void;
  getDefaultPosition(): Position;
  calculateChatPanelPosition(
    buttonPosition: Position,
    buttonSize: number,
  ): Position;
  calculateMenuPosition(
    buttonPosition: Position,
    buttonSize: number,
    isPanelOpen: boolean,
    chatPanelPosition?: Position,
  ): Position;
}

export interface IWidgetStateService {
  readonly isPanelOpen: boolean;
  readonly showMenu: boolean;
  readonly isHovered: boolean;
  readonly isDragging: boolean;

  togglePanel(): void;
  openPanel(): void;
  closePanel(): void;

  toggleMenu(): void;
  openMenu(): void;
  closeMenu(): void;

  setHovered(value: boolean): void;
  setDragging(value: boolean): void;

  // Subscribe to state changes
  subscribe(callback: (state: WidgetState) => void): () => void;
  getState(): WidgetState;
}

export interface WidgetState {
  isPanelOpen: boolean;
  showMenu: boolean;
  isHovered: boolean;
  isDragging: boolean;
}

export interface IEventService {
  handleWidgetClick(e: React.MouseEvent, isDragging: boolean): void;
  handleMenuClick(e: React.MouseEvent): void;
  handleSendMessage(message: string): void;
  handleSettingsClick(): void;
  handleKeyboardShortcutsClick(): void;
  handleClearConversation(): void;
  handleCloseMenu(): void;
  handleCloseChat(): void;
  handleMouseEnter(): void;
  handleMouseLeave(): void;
}

export interface IStorageService {
  loadSettings(): Promise<void>;
  watchStorageChanges(): () => void;
}

export interface IChatService {
  sendMessage(message: string): Promise<void>;
  connect(): Promise<void>;
  disconnect(): void;
  readonly isConfigured: boolean;
  readonly connectionStatus: string;
}

export interface INotificationService {
  initialize(): void;
  showError(message: string): void;
  showSuccess(message: string): void;
}
// Dependency Injection Container Interface

export interface IWidgetServices {
  positionService: IPositionService;
  stateService: IWidgetStateService;
  eventService: IEventService;
  storageService: IStorageService;
  chatService: IChatService;
  notificationService: INotificationService;
  pageAnalysis?: unknown
}
// Configuration interfaces
export interface WidgetConfiguration {
  storageKey: string;
  panelDimensions: WidgetDimensions;
  menuDimensions: WidgetDimensions;
  buttonSizes: Record<string, number>;
}

//
export interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

/** Keyboard shortcut configuration */
export interface KeyboardShortcuts {
  openPanel: string;
  closePanel: string;
  togglePanel: string;
  openMenu: string;
  closeMenu: string;
  toggleMenu: string;
}

/** Chat service provider configuration */
export interface ChatServiceConfig {
  provider: string;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  tone?: string;
}

/** Custom style overrides for the widget */
export interface CustomStyles {
  buttonBackground: string;
  buttonHoverBackground: string;
  panelBackground: string;
  menuBackground: string;
  textColor: string;
}

/** Custom icon overrides for the widget */
export interface CustomIcons {
  closeIcon: string;
  settingsIcon: string;
  sendIcon: string;
  menuIcon: string;
}

/** Custom animation settings */
export interface CustomAnimations {
  buttonHoverScale: string;
  panelOpenTransition: string;
  menuOpenTransition: string;
}

/** Accessibility features beyond basic settings */
export interface CustomAccessibilityFeatures {
  screenReaderAnnouncements: boolean;
  focusManagement: boolean;
  ariaLabels: boolean;
}

/** Content Security Policy configuration */
export interface CustomCSP {
  scriptSrc: string[];
  styleSrc: string[];
  connectSrc: string[];
  imgSrc: string[];
  fontSrc: string[];
}

/** Error handling and reporting configuration */
export interface CustomErrorHandling {
  logErrors: boolean;
  showNotifications: boolean;
  errorReportingEndpoint?: string;
}

/** Localization and translation configuration */
export interface CustomLocalization {
  defaultLanguage: string;
  supportedLanguages: string[];
  translations: Record<string, Record<string, string>>;
}

/** Performance optimization settings */
export interface CustomPerformanceOptimizations {
  lazyLoadComponents: boolean;
  codeSplitting: boolean;
  cachingStrategies: {
    apiResponses: boolean;
    staticAssets: boolean;
  };
}

/** Security features configuration */
export interface CustomSecurityFeatures {
  contentSecurityPolicy: string;
  secureCookies: boolean;
  inputSanitization: boolean;
}

/** Testing and debugging configuration */
export interface CustomTestingAndDebugging {
  enableDebugMode: boolean;
  loggingLevel: "error" | "warn" | "info" | "debug";
  testCoverageThreshold: number;
}

/** User preferences configuration */
export interface CustomUserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  notificationsEnabled: boolean;
  autoSaveEnabled: boolean;
  chatHistoryEnabled: boolean;
  chatHistoryRetentionDays: number;
  chatHistoryMaxMessages: number;
}

export interface WidgetSettings {
  storageKey: string;
  panelDimensions: WidgetDimensions;
  menuDimensions: WidgetDimensions;
  buttonSizes: Record<string, number>;
  defaultPosition: Position;
  defaultButtonSize: ButtonSize;
  accessibilitySettings: AccessibilitySettings;
  keyboardShortcuts: KeyboardShortcuts;
  chatServiceConfig: ChatServiceConfig;
  customStyles: CustomStyles;
  customIcons: CustomIcons;
  customAnimations: CustomAnimations;
  customAccessibilityFeatures: CustomAccessibilityFeatures;
  customCSP: CustomCSP;
  customErrorHandling: CustomErrorHandling;
  customLocalization: CustomLocalization;
  customPerformanceOptimizations: CustomPerformanceOptimizations;
  customSecurityFeatures: CustomSecurityFeatures;
  customTestingAndDebugging: CustomTestingAndDebugging;
  customUserPreferences: CustomUserPreferences;
}
