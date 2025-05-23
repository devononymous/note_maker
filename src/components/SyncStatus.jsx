import React from 'react'

const SyncStatus = ({ isOnline }) => (
        <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
    {isOnline ? '🟢 Online - Syncing Enabled' : '🔴 Offline - Changes will sync when online'}
    </div>
)

export default SyncStatus;