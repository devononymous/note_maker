import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
        const [online, setOnline] = useState(navigator.onLine);

        useEffect(() => {
                const goOnline = () => setOnline(true);
                const goOffline = () => setOnline(false);

                window.addEventListener('online', goOnline);
                window.addEventListener('offline', goOffline);

                return () => {
                        window.removeEventListener('online', goOnline);
                        window.removeEventListener('offline', goOffline);
                };
        }, []);

        return online;
};
