import React from 'react';
import styles from './SyncStatus.module.css';

const SyncStatus = ({ online }) => {
  return (
    <div className={styles.statusBar}>
      {online ? (
        <span className={styles.online}>Online — Notes will sync automatically</span>
      ) : (
        <span className={styles.offline}>Offline — Changes will sync when online</span>
      )}
    </div>
  );
};

export default SyncStatus;
