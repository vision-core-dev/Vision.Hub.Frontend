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
            console.log('✅ Connected to online users WebSocket');
            setReconnectAttempts(0);

            // Identify ourselves
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
                        console.log('✅ Identified on online users WebSocket');
                        break;

                    case 'online_users':
                        // Update online users list
                        setOnlineUserIds(new Set(message.user_ids));
                        console.log(`👥 Online users: ${message.count}`);
                        break;

                    case 'pong':
                        // Heartbeat response
                        break;

                    case 'error':
                        console.error('WebSocket error:', message.message);
                        break;

                    default:
                        console.log('Unknown message type:', message);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        websocket.onclose = () => {
            console.log('❌ Disconnected from online users WebSocket');

            // Attempt to reconnect
            if (reconnectAttempts < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
                console.log(`Reconnecting in ${delay}ms...`);
                setTimeout(() => {
                    setReconnectAttempts(prev => prev + 1);
                    connect();
                }, delay);
            } else {
                console.error('Max reconnection attempts reached');
            }
        };

        // Heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // 30 seconds

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
        console.log("isUserOnline", userId, onlineUserIds.has(userId));
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
