import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/core/auth/AuthContext';

interface OnlineUsersContextType {
    onlineUserIds: Set<string>;
    isUserOnline: (userId: string) => boolean;
    onlineCount: number;
}

const OnlineUsersContext = createContext<OnlineUsersContextType | undefined>(undefined);

export const useOnlineUsers = () => {
    const context = useContext(OnlineUsersContext);
    if (!context) {
        throw new Error('useOnlineUsers must be used within OnlineUsersProvider');
    }
    return context;
};

interface OnlineUsersProviderProps {
    children: ReactNode;
}

export const OnlineUsersProvider = ({ children }: OnlineUsersProviderProps) => {
    const { user } = useAuth();
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (!user?.id) return;

        const wsUrl = `${import.meta.env.VITE_WS_URL}/v1/Hub/ws/online`;
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            setReconnectAttempts(0);

            websocket.send(JSON.stringify({
                type: 'identify',
                user_id: user.id,
            }));
        };

        websocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                switch (message.type) {
                    case 'connected':
                        break;

                    case 'online_users':
                        setOnlineUserIds(new Set(message.user_ids));
                        break;

                    case 'pong':
                        break;

                    case 'error':
                        break;

                    default:
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {

            if (reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                setTimeout(() => {
                    setReconnectAttempts(prev => prev + 1);
                    connect();
                }, delay);
            }
        };

        const heartbeatInterval = setInterval(() => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);

        return () => {
            clearInterval(heartbeatInterval);
            websocket.close();
        };
    }, [user?.id, reconnectAttempts]);

    useEffect(() => {
        if (!user?.id) return;

        const cleanup = connect();

        return () => {
            if (cleanup) cleanup();
        };
    }, [user?.id, connect]);

    const isUserOnline = useCallback((userId: string) => {
        return onlineUserIds.has(userId);
    }, [onlineUserIds]);

    const value: OnlineUsersContextType = {
        onlineUserIds,
        isUserOnline,
        onlineCount: onlineUserIds.size,
    };

    return (
        <OnlineUsersContext.Provider value={value}>
            {children}
        </OnlineUsersContext.Provider>
    );
};
