import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
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
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 10;
    const wsRef = useRef<WebSocket | null>(null);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        let isCancelled = false;

        const connect = () => {
            if (isCancelled) return;

            // Clean up previous connection
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.onerror = null;
                wsRef.current.close();
            }

            const wsUrl = `${import.meta.env.VITE_WS_URL}/v1/Hub/ws/online`;
            const websocket = new WebSocket(wsUrl);
            wsRef.current = websocket;

            websocket.onopen = () => {
                reconnectAttemptsRef.current = 0;

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

            websocket.onerror = () => {
                // Errors are handled in onclose
            };

            websocket.onclose = () => {
                if (isCancelled) return;

                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    reconnectAttemptsRef.current += 1;
                    reconnectTimerRef.current = setTimeout(connect, delay);
                }
            };

            // Heartbeat
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            heartbeatRef.current = setInterval(() => {
                if (websocket.readyState === WebSocket.OPEN) {
                    websocket.send(JSON.stringify({ type: 'ping' }));
                }
            }, 30000);
        };

        connect();

        return () => {
            isCancelled = true;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [user?.id]);

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
