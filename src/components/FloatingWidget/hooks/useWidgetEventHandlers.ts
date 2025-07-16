import { useAppDispatch } from "../../../store/hooks";
import { clearConversation } from "../../../store/slices/chatSlice";
import { useWidgetEvents } from "./index";
import { useWidgetStateIntegration } from "./useWidgetStateIntegration";

export const useWidgetEventHandlers = () => {
  const dispatch = useAppDispatch();
  const eventService = useWidgetEvents();
  const widgetState = useWidgetStateIntegration();

  const handleClearConversationClick = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all messages? This cannot be undone.",
      )
    ) {
      dispatch(clearConversation());
    }
    widgetState.closeMenu();
  };

  const handleChatToggle = () => {
    if (widgetState.isPanelOpen) {
      widgetState.closePanel();
    } else {
      widgetState.openPanel();
    }
  };

  const handleClickOutside = () => {
    if (widgetState.isPanelOpen) widgetState.closePanel();
    if (widgetState.showMenu) {
      widgetState.closeMenu();
    }
  };

  const handleSendMessage = async (message: string) => {
    await eventService.handleSendMessage(message);
  };

  return {
    handleClearConversationClick,
    handleChatToggle,
    handleClickOutside,
    handleSendMessage,
    eventService,
  };
};
