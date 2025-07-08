import { useEffect } from 'react';
import { NotificationService } from '../../../services/notificationService';

export const useNotificationService = () => {
  useEffect(() => {
    NotificationService.initialize();
  }, []);
};
