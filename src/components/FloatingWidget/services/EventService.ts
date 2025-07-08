import type { IEventService, IWidgetStateService, IChatService } from '../interfaces';
import { ExtensionContext } from '../../../utils/extensionContext';

export class EventService implements IEventService {
  private stateService: IWidgetStateService;
  private chatService: IChatService;

  constructor(
    stateService: IWidgetStateService,
    chatService: IChatService
  ) {
    this.stateService = stateService;
    this.chatService = chatService;
  }

  handleWidgetClick(e: React.MouseEvent, isDragging: boolean): void {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) return;

    this.stateService.togglePanel();
    this.stateService.closeMenu();
  }

  handleMenuClick(e: React.MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const wasMenuOpen = this.stateService.showMenu;
    this.stateService.toggleMenu();

    if (!wasMenuOpen) {
      this.stateService.setHovered(true);
    }
  }

  handleSendMessage(message: string): void {
    this.chatService.sendMessage(message);
  }

  handleSettingsClick(): void {
    // Check extension context and handle errors gracefully
    if (!ExtensionContext.isValid()) {
      ExtensionContext.showContextError();
      this.handleCloseMenu();
      return;
    }

    // Send message to background script to open popup with error handling
    if (typeof chrome !== "undefined" && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({ action: "openPopup" }, () => {
          if (chrome.runtime.lastError) {
            // Handle extension context invalidated error
            if (
              chrome.runtime.lastError.message?.includes(
                "Extension context invalidated"
              )
            ) {
              ExtensionContext.showContextError();
            } else {
              console.warn(
                "Could not open popup:",
                chrome.runtime.lastError.message
              );
            }
          }
        });
      } catch (error) {
        console.warn("Chrome runtime error:", error);
        ExtensionContext.showContextError();
      }
    } else {
      console.warn("Chrome extension API not available");
    }
    
    this.handleCloseMenu();
  }

  handleKeyboardShortcutsClick(): void {
    alert(
      "Keyboard Shortcuts:\n• Ctrl+Shift+A: Toggle widget\n• Enter: Send message\n• Shift+Enter: New line\n• Esc: Close chat"
    );
    this.handleCloseMenu();
  }

  handleClearConversation(): void {
    if (window.confirm("Are you sure you want to clear all messages? This cannot be undone.")) {
      // TODO: This should be injected as a Redux service dependency
      // For now, we'll handle this in the component level
    }
    this.handleCloseMenu();
  }

  handleCloseMenu(): void {
    this.stateService.closeMenu();
    this.stateService.setHovered(false);
  }

  handleCloseChat(): void {
    this.stateService.closePanel();
  }

  handleMouseEnter(): void {
    if (!this.stateService.isDragging) {
      this.stateService.setHovered(true);
    }
  }

  handleMouseLeave(): void {
    if (!this.stateService.isDragging) {
      this.stateService.setHovered(false);
    }
  }
}
