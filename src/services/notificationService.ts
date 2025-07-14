// Notification Service for the chat widget
export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailSummary: boolean;
  emailAddress: string;
  emailFrequency: "immediate" | "daily" | "weekly";
  emailEnabled: boolean;
  accessibilitySettings?: {
    highContrast: boolean;
    reducedMotion: boolean;
    screenReaderOptimized: boolean;
  };
}

export class NotificationService {
  private static hasPermission = false;

  // Initialize notification permissions
  static async initialize(): Promise<void> {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === "granted";
      } else {
        this.hasPermission = Notification.permission === "granted";
      }
    }
  }

  // Play notification sound
  static playNotificationSound(): void {
    try {
      // Create a simple notification sound using Web Audio API
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set frequency for a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      // Set volume
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );

      // Play the sound
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn("Unable to play notification sound:", error);
    }
  }

  // Show desktop notification
  static showDesktopNotification(
    message: string,
    assistantName = "AI Assistant",
  ): void {
    if (!this.hasPermission) {
      console.warn("Desktop notifications not permitted");
      return;
    }

    try {
      const notification = new Notification(`${assistantName} replied`, {
        body:
          message.length > 100 ? message.substring(0, 100) + "..." : message,
        icon: "/vite.svg", // Use the app icon
        tag: "ai-chat-response", // Prevents multiple notifications
        requireInteraction: false,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Focus window when notification is clicked
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.warn("Unable to show desktop notification:", error);
    }
  }

  // Main notification method
  static notify(
    message: string,
    settings: NotificationSettings,
    assistantName = "AI Assistant",
  ): void {
    if (settings.soundEnabled) {
      this.playNotificationSound();
    }

    if (settings.desktopNotifications) {
      this.showDesktopNotification(message, assistantName);
    }
  }
}
