import React from "react";
import { useAppSelector } from "../../../store/hooks";
import { selectAssistantName } from "../../../store/selectors/settingsSelectors";
import type { Message } from "../../../types/chat.types";
import {
  MessageContainer,
  MessageBubble,
  MessageAvatar,
  MessageContent,
  MessageText,
  MessageTimestamp,
} from "../styled-components";

interface MessageItemProps {
  message: Message;
}

const MessageItemStyled: React.FC<MessageItemProps> = ({ message }) => {
  const assistantName = useAppSelector(selectAssistantName);

  const getAvatarText = (sender: string) => {
    switch (sender) {
      case "user":
        return "U";
      case "ai":
        // Use first letter of assistant name, fallback to 'AI'
        return assistantName ? assistantName.charAt(0).toUpperCase() : "AI";
      case "system":
        return "S";
      case "error":
        return "E";
      default:
        return "?";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  return (
    <MessageContainer sender={message.sender}>
      <MessageAvatar sender={message.sender}>
        {getAvatarText(message.sender)}
      </MessageAvatar>
      <MessageContent>
        {" "}
        <MessageBubble sender={message.sender}>
          <MessageText>
            <p>{message.text}</p>
          </MessageText>
        </MessageBubble>
        <MessageTimestamp>
          {formatTimestamp(message.timestamp)}
        </MessageTimestamp>
      </MessageContent>
    </MessageContainer>
  );
};

export default MessageItemStyled;
