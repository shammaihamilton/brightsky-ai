// Core interfaces for SOLID FloatingWidget implementation

export interface Position {
  x: number;
  y: number;
}

export interface ButtonSize {
  size: 'small' | 'medium' | 'large';
}

export interface WidgetDimensions {
  width: number;
  height: number;
}

// Single Responsibility Principle - Each interface has one clear purpose

export interface IPositionService {
  getPosition(): Position;
  setPosition(position: Position): void;
  getDefaultPosition(): Position;
  calculateChatPanelPosition(buttonPosition: Position, buttonSize: number): Position;
  calculateMenuPosition(buttonPosition: Position, buttonSize: number, isPanelOpen: boolean, chatPanelPosition?: Position): Position;
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
  watchStorageChanges(): () => void; // Returns cleanup function
}

export interface IChatService {
  sendMessage(message: string): void;
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
}

// Configuration interfaces
export interface WidgetConfiguration {
  storageKey: string;
  panelDimensions: WidgetDimensions;
  menuDimensions: WidgetDimensions;
  buttonSizes: Record<string, number>;
}
