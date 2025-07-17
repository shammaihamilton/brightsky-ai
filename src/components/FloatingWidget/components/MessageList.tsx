import React, { useEffect, useRef } from "react";
import type { Message } from "../../../types/chat.types";
import styles from "../styles/MessageList.module.css";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const isAiLoading = useAppSelector(selectIsAiLoading);

  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll when component mounts with existing messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  return (
    <div className={styles.messageListContainer}>
      {messages.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateIcon}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className={styles.emptyStateTitle}>Start a conversation</p>
          <p className={styles.emptyStateSubtitle}>Ask me anything!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
          <div className={styles.scrollAnchor} ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
