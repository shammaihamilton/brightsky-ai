import type { IWidgetStateService, WidgetState } from "../interfaces";

export class WidgetStateService implements IWidgetStateService {
  private state: WidgetState = {
    isPanelOpen: false,
    showMenu: false,
    isHovered: false,
    isDragging: false,
  };

  private subscribers: Set<(state: WidgetState) => void> = new Set();

  get isPanelOpen(): boolean {
    return this.state.isPanelOpen;
  }

  get showMenu(): boolean {
    return this.state.showMenu;
  }

  get isHovered(): boolean {
    return this.state.isHovered;
  }

  get isDragging(): boolean {
    return this.state.isDragging;
  }

  togglePanel(): void {
    this.updateState({ isPanelOpen: !this.state.isPanelOpen });
  }

  openPanel(): void {
    this.updateState({ isPanelOpen: true });
  }

  closePanel(): void {
    this.updateState({ isPanelOpen: false });
  }

  toggleMenu(): void {
    this.updateState({ showMenu: !this.state.showMenu });
  }

  openMenu(): void {
    this.updateState({ showMenu: true });
  }

  closeMenu(): void {
    this.updateState({ showMenu: false });
  }

  setHovered(value: boolean): void {
    this.updateState({ isHovered: value });
  }

  setDragging(value: boolean): void {
    this.updateState({ isDragging: value });
  }

  subscribe(callback: (state: WidgetState) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getState(): WidgetState {
    return { ...this.state };
  }

  private updateState(partialState: Partial<WidgetState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...partialState };

    // Notify subscribers if state actually changed
    if (this.hasStateChanged(previousState, this.state)) {
      this.notifySubscribers();
    }
  }

  private hasStateChanged(prev: WidgetState, current: WidgetState): boolean {
    return Object.keys(current).some(
      (key) =>
        prev[key as keyof WidgetState] !== current[key as keyof WidgetState],
    );
  }

  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach((callback) => {
      try {
        callback(currentState);
      } catch (error) {
        console.error("Error in state subscriber:", error);
      }
    });
  }
}
