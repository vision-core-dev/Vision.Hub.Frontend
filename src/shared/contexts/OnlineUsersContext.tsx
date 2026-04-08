import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface OnlineUsersContextType {
    onlineUserIds: Set<string>;
    isUserOnline: (userId: string) => boolean;
    onlineCount: number;
    isConnected: boolean;
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
    const [isConnected, setIsConnected] = useState(true);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 50; // Increased for better UX
    const wsRef = useRef<WebSocket | null>(null);
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = useCallback(() => {
        if (!user?.id) return;

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
            console.log("WebSocket Connected");
            setIsConnected(true);
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
                    case 'online_users':
                        setOnlineUserIds(new Set(message.user_ids));
                        break;
                    case 'pong':
                        break;
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        websocket.onclose = () => {
            console.log("WebSocket Disconnected");
            setIsConnected(false);

            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 10000);
                reconnectAttemptsRef.current += 1;
                reconnectTimerRef.current = setTimeout(connect, delay);
            }
        };

        websocket.onerror = () => {
             setIsConnected(false);
        };

        // Heartbeat
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        heartbeatRef.current = setInterval(() => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        connect();

        return () => {
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null;
                wsRef.current.close();
            }
        };
    }, [user?.id, connect]);

    const isUserOnline = useCallback((userId: string) => {
        return onlineUserIds.has(userId);
    }, [onlineUserIds]);

    const showBanner = !isConnected && reconnectAttemptsRef.current >= 2;

    const value: OnlineUsersContextType = {
        onlineUserIds,
        isUserOnline,
        onlineCount: onlineUserIds.size,
        isConnected,
    };

    return (
        <OnlineUsersContext.Provider value={value}>
            <div className="flex flex-col h-screen">
                {showBanner && (
                    <div className="w-full z-[9999] animate-in slide-in-from-top duration-300 shrink-0">
                        <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg">
                            <AlertTriangle size={18} className="animate-pulse" />
                            <span className="text-sm font-semibold tracking-wide uppercase">
                                Відсутнє підключення до сервера
                            </span>
                            <div className="flex items-center gap-1.5 ml-4 px-2 py-0.5 bg-amber-600/50 rounded-full text-[10px] font-bold">
                               <RefreshCw size={10} className="animate-spin" />
                               ПЕРЕПІДКЛЮЧЕННЯ...
                            </div>
                        </div>
                        <div className="h-0.5 bg-amber-400 w-full animate-progress" />
                    </div>
                )}
                <div className="flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </OnlineUsersContext.Provider>
    );
};
