import type { INotificationService } from '../interfaces';
import { NotificationService as BaseNotificationService } from '../../../services/notificationService';

export class NotificationService implements INotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  initialize(): void {
    BaseNotificationService.initialize();
  }

  showError(message: string): void {
    console.error('[Widget Error]:', message);
    // Could integrate with the base notification service here
  }

  showSuccess(message: string): void {
    console.log('[Widget Success]:', message);
    // Could integrate with the base notification service here
  }
}
