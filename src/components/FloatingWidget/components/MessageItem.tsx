import React from "react";
import { useAppSelector } from "../../../store/hooks";
import { selectAssistantName } from "../../../store/selectors/settingsSelectors";
import type { Message } from "../../../types/chat.types";
import styles from '../styles/MessageItem.module.css';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const assistantName = useAppSelector(selectAssistantName);

  const getAvatarText = (sender: string) => {
    switch (sender) {
      case "user":
        return "U";
      case "ai": {
        // Use first letter of assistant name, fallback to 'AI'
        const result = assistantName ? assistantName.charAt(0).toUpperCase() : "AI";
        return result;
      }
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

  // Simplified class name mapping
  const getSenderClass = (sender: string) => {
    switch (sender) {
      case "user":
        return styles.senderUser;
      case "ai":
        return styles.senderAi;
      case "system":
        return styles.senderSystem;
      case "error":
        return styles.senderError;
      default:
        return '';
    }
  };

  const getBubbleClass = (sender: string) => {
    switch (sender) {
      case "user":
        return styles.bubbleUser;
      case "ai":
        return styles.bubbleAi;
      case "system":
        return styles.bubbleSystem;
      case "error":
        return styles.bubbleError;
      default:
        return '';
    }
  };

  const containerClass = `${styles.messageContainer} ${getSenderClass(message.sender)}`;

  return (
    <div className={containerClass}>
      <div 
        className={styles.messageAvatar}
        data-sender={message.sender}
      >
        {getAvatarText(message.sender)}
      </div>
      <div className={styles.messageContent}>
        <div className={`${styles.messageBubble} ${getBubbleClass(message.sender)}`}>
          <div className={styles.messageText}>
            <p>{message.text}</p>
          </div>
        </div>
        <div className={styles.messageTimestamp}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;