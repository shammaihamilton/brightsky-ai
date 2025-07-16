import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setConnectionStatus, selectConnectionStatus } from "../../../store/slices/chatSlice";
import { useWidgetChat } from "./index";

export const useConnectionStatus = () => {
  const dispatch = useAppDispatch();
  const chatService = useWidgetChat();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Update connection status based on chat service
    if (chatService.isConfigured) {
      dispatch(setConnectionStatus("connected"));
    } else {
      dispatch(setConnectionStatus("disconnected"));
    }
  }, [chatService.isConfigured, dispatch]);

  useEffect(() => {
    // Update local state based on Redux connection status
    switch (connectionStatus) {
      case 'connected':
        setIsConnected(true);
        setIsConnecting(false);
        break;
      case 'connecting':
        setIsConnected(false);
        setIsConnecting(true);
        break;
      case 'disconnected':
      case 'error':
        setIsConnected(false);
        setIsConnecting(false);
        break;
    }
  }, [connectionStatus]);

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    statusText: connectionStatus === 'connected' ? 'Connected' : 
                connectionStatus === 'connecting' ? 'Connecting...' :
                connectionStatus === 'error' ? 'Connection Error' : 'Disconnected'
  };
};
