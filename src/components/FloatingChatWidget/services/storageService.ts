import type { Position } from "../types/widget.types";
import { STORAGE_KEY } from "../config/widgetConfig";

export class StorageService {
  static savePosition(position: Position): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
      }
    } catch (error) {
      console.warn("Failed to save widget position:", error);
    }
  }

  static loadPosition(): Position | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            return parsed;
          }
        }
      }
    } catch (error) {
      console.warn("Failed to load widget position:", error);
    }
    return null;
  }

  static clearPosition(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.warn("Failed to clear widget position:", error);
    }
  }
}
