import { useWidgetServices } from "./useWidgetServices";

// Specific service hooks for convenience
export const useWidgetState = () => {
  const { stateService } = useWidgetServices();
  return stateService;
};

export const useWidgetPosition = () => {
  const { positionService } = useWidgetServices();
  return positionService;
};

export const useWidgetEvents = () => {
  const { eventService } = useWidgetServices();
  return eventService;
};

export const useWidgetStorage = () => {
  const { storageService } = useWidgetServices();
  return storageService;
};

export const useWidgetChat = () => {
  const { chatService } = useWidgetServices();
  return chatService;
};

export const useWidgetNotifications = () => {
  const { notificationService } = useWidgetServices();
  return notificationService;
};



// New refactored hooks
export { usePositionCalculations } from "./usePositionCalculations";
export { useStorageIntegration } from "./useStorageIntegration";
export { useWidgetEventHandlers } from "./useWidgetEventHandlers";
export { useConnectionStatus } from "./useConnectionStatus";
export { usePrivacySettings } from "./usePrivacySettings";
export { useNotificationService } from "./useNotificationService";
