import { useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setConnectionStatus } from '../../../store/slices/chatSlice';
import { useWidgetChat } from './index';

export const useConnectionStatus = () => {
  const dispatch = useAppDispatch();
  const chatService = useWidgetChat();

  useEffect(() => {
    if (chatService.isConfigured) {
      dispatch(setConnectionStatus("connected"));
      console.log("AI is configured - connection status set to connected");
    } else {
      dispatch(setConnectionStatus("disconnected"));
      console.log("AI is not configured - connection status set to disconnected");
    }
  }, [chatService.isConfigured, dispatch]);
};
