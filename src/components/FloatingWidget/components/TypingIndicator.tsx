import React from 'react';
import styles from '../styles/TypingIndicator.module.css';

interface TypingIndicatorProps {
  isVisible: boolean;
  text?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible, 
  text = "AI is thinking..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className={styles.typingIndicator}>
      <div className={styles.avatar}>
        <div className={styles.aiIcon}>🤖</div>
      </div>
      <div className={styles.content}>
        <span className={styles.text}>{text}</span>
        <div className={styles.dots}>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>
    </div>
  );
};
