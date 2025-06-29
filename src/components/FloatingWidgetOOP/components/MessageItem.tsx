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
    <div className={`${styles.messageContainer} ${styles[`sender-${message.sender}`]}`}>
      <div className={`${styles.messageAvatar} ${styles[`avatar-${message.sender}`]}`}>
        {getAvatarText(message.sender)}
      </div>
      <div className={styles.messageContent}>
        <div className={`${styles.messageBubble} ${styles[`bubble-${message.sender}`]}`}>
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
