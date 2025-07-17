import React from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import styles from '../styles/ConnectionStatusIndicator.module.css';

interface ConnectionStatusIndicatorProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  showText = false,
  size = 'small',
  className = ''
}) => {
  const { isConnected, isConnecting, statusText } = useConnectionStatus();

  const getStatusClass = () => {
    if (isConnecting) return styles.connecting;
    if (isConnected) return styles.connected;
    return styles.disconnected;
  };

  return (
    <div className={`${styles.indicator} ${styles[size]} ${className}`}>
      <div className={`${styles.dot} ${getStatusClass()}`} />
      {showText && <span className={styles.statusText}>{statusText}</span>}
    </div>
  );
};
