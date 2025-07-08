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
    } else {
      dispatch(setConnectionStatus("disconnected"));
    }
  }, [chatService.isConfigured, dispatch]);
};
