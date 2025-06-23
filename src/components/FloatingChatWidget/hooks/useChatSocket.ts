import { useEffect } from 'react';
import { socket } from './socket';
import { useAppDispatch } from '../../../store/hooks';
import { setConnectionStatus } from '../../../store/slices/chatSlice';

// Define types for incoming socket events
interface AiMessageChunkPayload {
  messageId: string;
  chunk: string;
}

interface AiMessageDonePayload {
  messageId: string;
}

interface AiMessageErrorPayload {
  messageId: string;
  error: string;
}

export const useChatSocket = (
  onChunk: (msg: string, id: string) => void,
  onDone: (id: string) => void,
  onError?: (id: string, error: string) => void
) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      dispatch(setConnectionStatus('connected'));
    });

    socket.on('disconnect', () => {
      dispatch(setConnectionStatus('disconnected'));
    });

    socket.on('ai_message_chunk', ({ messageId, chunk }: AiMessageChunkPayload) => {
      onChunk(chunk, messageId);
    });

    socket.on('ai_message_done', ({ messageId }: AiMessageDonePayload) => {
      onDone(messageId);
    });

    socket.on('ai_message_error', ({ messageId, error }: AiMessageErrorPayload) => {
      onError?.(messageId, error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ai_message_chunk');
      socket.off('ai_message_done');
      socket.off('ai_message_error');
    };
  }, [onChunk, onDone, onError, dispatch]);

  const sendUserMessage = (text: string, messageId: string) => {
    socket.emit('user_message', { text, messageId });
  };

  return { sendUserMessage };
};
