// Utility to check if Chrome extension context is still valid
export class ExtensionContext {
  // Check if we're running in a Chrome extension context
  static isExtensionContext(): boolean {
    return typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
  }

  // Check if the extension context is still valid
  static isValid(): boolean {
    try {
      if (typeof chrome === "undefined" || !chrome.runtime) {
        return false;
      }

      // chrome.runtime.id will be undefined if the extension context is invalidated
      return !!chrome.runtime.id;
    } catch (error) {
      console.warn("Extension context check failed:", error);
      return false;
    }
  }

  // Safe wrapper for Chrome API calls
  static async safeCall<T>(
    operation: () => Promise<T> | T,
    fallback?: T,
  ): Promise<T | undefined> {
    try {
      if (!this.isValid()) {
        // Only log in development mode to reduce noise
        if (process.env.NODE_ENV === "development") {
          console.warn("Extension context is invalid, skipping operation");
        }
        return fallback;
      }

      return await operation();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Extension context invalidated")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Extension context invalidated during operation");
        }
        return fallback;
      }

      console.error("Extension operation failed:", error);
      throw error;
    }
  }

  // Display user-friendly error message
  static showContextError(): void {
    console.warn(
      "Extension was reloaded. Please refresh the page to continue using the AI widget.",
    );

    // Create a simple notification that doesn't rely on Chrome APIs
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee2e2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 2147483647;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    `;
    notification.textContent =
      "⚠️ Extension reloaded. Please refresh the page to continue using the AI widget.";

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}
