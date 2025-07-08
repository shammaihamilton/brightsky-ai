import React, { useMemo, type ReactNode } from "react";
import type { IWidgetServices, WidgetConfiguration } from "../interfaces";
import { WidgetContext } from "./WidgetContextProvider";
import {
  PositionService,
  WidgetStateService,
  EventService,
  StorageService,
  ChatService,
  NotificationService,
} from "../services";
import { useAIChat } from "../../../hooks/useAIChat";

interface StorageSettings {
  apiSettings?: unknown;
  chatSettings?: unknown;
}

const DEFAULT_CONFIG: WidgetConfiguration = {
  storageKey: "optimized-widget-position",
  panelDimensions: { width: 320, height: 280 },
  menuDimensions: { width: 200, height: 300 },
  buttonSizes: {
    small: 44,
    medium: 56,
    large: 68,
  },
};

interface WidgetProviderProps {
  children: ReactNode;
  config?: Partial<WidgetConfiguration>;

  onSettingsChange?: (settings: StorageSettings) => void;
}

export const WidgetProvider: React.FC<WidgetProviderProps> = ({
  children,
  config = {},
  onSettingsChange,
}) => {
  const aiChat = useAIChat();

  const services = useMemo<IWidgetServices>(() => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Create services with dependency injection
    const positionService = new PositionService(
      finalConfig.storageKey,
      finalConfig.panelDimensions,
      finalConfig.menuDimensions
    );

    const stateService = new WidgetStateService();
    const chatService = new ChatService(aiChat);
    const notificationService = NotificationService.getInstance();
    const storageService = new StorageService(onSettingsChange);

    const eventService = new EventService(stateService, chatService);

    return {
      positionService,
      stateService,
      eventService,
      storageService,
      chatService,
      notificationService,
    };
  }, [config, aiChat, onSettingsChange]);

  return (
    <WidgetContext.Provider value={services}>{children}</WidgetContext.Provider>
  );
};
