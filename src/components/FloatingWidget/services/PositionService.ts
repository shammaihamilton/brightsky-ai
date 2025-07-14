import type {
  Position,
  IPositionService,
  WidgetDimensions,
} from "../interfaces";

export class PositionService implements IPositionService {
  private currentPosition: Position;
  private readonly storageKey: string;
  private readonly panelDimensions: WidgetDimensions;
  private readonly menuDimensions: WidgetDimensions;

  constructor(
    storageKey: string,
    panelDimensions: WidgetDimensions,
    menuDimensions: WidgetDimensions,
  ) {
    this.storageKey = storageKey;
    this.panelDimensions = panelDimensions;
    this.menuDimensions = menuDimensions;
    this.currentPosition = this.loadFromStorage() || this.getDefaultPosition();
  }

  getPosition(): Position {
    return { ...this.currentPosition };
  }

  setPosition(position: Position): void {
    this.currentPosition = { ...position };
    this.saveToStorage(position);
  }

  getDefaultPosition(): Position {
    return {
      x: Math.max(20, window.innerWidth - 100),
      y: Math.max(20, window.innerHeight - 100),
    };
  }

  calculateChatPanelPosition(
    buttonPosition: Position,
    buttonSize: number,
  ): Position {
    const { width: panelWidth, height: panelHeight } = this.panelDimensions;
    const padding = 15;

    let x = buttonPosition.x - panelWidth;
    let y = buttonPosition.y - panelHeight - 10;

    // Adjust if panel would go off-screen
    if (x < padding) {
      x = buttonPosition.x + buttonSize;
    }

    if (y < padding) {
      y = buttonPosition.y + buttonSize + 10;
    }

    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }

    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }

    return { x, y };
  }

  calculateMenuPosition(
    buttonPosition: Position,
    buttonSize: number,
    isPanelOpen: boolean,
    chatPanelPosition?: Position,
  ): Position {
    const { width: menuWidth, height: menuHeight } = this.menuDimensions;
    const padding = 10;
    const gap = 2;

    let x = buttonPosition.x + buttonSize + gap;
    let y = buttonPosition.y + buttonSize + gap;

    // Adjust if menu would go off-screen
    if (x + menuWidth > window.innerWidth - padding) {
      x = buttonPosition.x - menuWidth - gap;
    }

    if (y + menuHeight > window.innerHeight - padding) {
      y = buttonPosition.y - menuHeight - gap + 30;
    }

    if (x < padding) x = padding;
    if (y < padding) y = padding;

    // Avoid collision with chat panel if open
    if (isPanelOpen && chatPanelPosition) {
      if (
        x < chatPanelPosition.x + this.panelDimensions.width &&
        x + menuWidth > chatPanelPosition.x &&
        y < chatPanelPosition.y + this.panelDimensions.height &&
        y + menuHeight > chatPanelPosition.y
      ) {
        x = Math.min(
          window.innerWidth - menuWidth - padding,
          chatPanelPosition.x + this.panelDimensions.width + 10,
        );
      }
    }

    return { x, y };
  }

  private loadFromStorage(): Position | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn("Failed to load position from storage:", error);
      return null;
    }
  }

  private saveToStorage(position: Position): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(position));
    } catch (error) {
      console.warn("Failed to save position to storage:", error);
    }
  }
}
