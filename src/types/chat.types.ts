// /types/chat.types.ts
export type MessageSender = 'user' | 'ai' | 'system' | 'error';
export type MessageStatus = 'sending' | 'sent' | 'failed'; 
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
export type Theme = 'light' | 'dark' | 'system';
export type BubbleStyle = 'modern' | 'classic' | 'minimal'
export type FontSize = 'small' | 'medium' | 'large'; 
export type ButtonSize = 'small' | 'medium' | 'large'; 
export type SnapPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'custom';
export type Tone = 'Friendly' | 'Formal' | 'Casual' | 'Professional';
export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  tokens?: string[];
  timestamp: string;
  status: MessageStatus;
  isOffline?: boolean;
  isTyping?: boolean;
  isFinal?: boolean;
  seenChunks?: Array<string>;
}


// Matches the state structure in chatSettingsSlice.ts
export interface ChatSettings {
  assistantName: string;
  assistantAvatar?: string;
  tone: Tone;
  theme: Theme;
  privacy: {
    saveHistory: boolean;
    autoClearDays?: number;
  };
  defaultButtonVisible: boolean;
  buttonSize?: ButtonSize;
  defaultPosition?: SnapPosition;
  bubbleStyle?: BubbleStyle;
  fontSize?: FontSize;
  notifications?: {
    soundEnabled: boolean;
    desktopNotifications: boolean;
    emailSummary: boolean;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
}

export interface ButtonPositionState {
  position: SnapPosition;
  x?: number;
  y?: number;
}