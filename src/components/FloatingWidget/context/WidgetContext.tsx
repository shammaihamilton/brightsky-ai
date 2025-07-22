import React, { useMemo, type ReactNode } from "react";
import type { IWidgetServices, WidgetConfiguration } from "../interfaces";
import { WidgetContext } from "./WidgetContextProvider";
import {
  PositionService,
  WidgetStateService,
  EventService,
  StorageService,
  NotificationService,
} from "../services";
import { WebSocketService } from '../services/websocket';
import { useAppDispatch } from "../../../store/hooks";
import { usePageAnalysis } from "@/hooks/usePageAnalysis";

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
  const dispatch = useAppDispatch();

  const pageAnalysis = usePageAnalysis({
      autoStart: true,
      analysisInterval: 3000,
      enableLogging: true
  });
  const services = useMemo<IWidgetServices>(() => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Create services with dependency injection
    const positionService = new PositionService(
      finalConfig.storageKey,
      finalConfig.panelDimensions,
      finalConfig.menuDimensions
    );

    const stateService = new WidgetStateService();
    
    // Use ChromeExtensionWebSocketService for both Chrome extension and regular web pages
    const chatService = new WebSocketService(dispatch);
    
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
      pageAnalysis,
    };
  }, [config, onSettingsChange, dispatch, pageAnalysis]);

  return (
    <WidgetContext.Provider value={services}>{children}</WidgetContext.Provider>
  );
};
