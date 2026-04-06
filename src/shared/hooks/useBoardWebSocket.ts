import { useEffect, useRef, useCallback, useState } from 'react';

interface UseBoardWebSocketOptions {
    boardId: string | undefined;
    onUpdate?: () => void;
    onUserPresenceChange?: (users: ActiveUser[]) => void;
    enabled?: boolean;
    currentUser?: {
        user_id: string;
        name: string;
        avatar_url?: string;
        is_guest?: boolean;
    };
}

interface WebSocketMessage {
    type: string;
    action?: string;
    data?: any;
    message?: string;
    board_id?: string;
    timestamp?: string;
    users?: ActiveUser[];
    count?: number;
}

export interface ActiveUser {
    user_id: string;
    name: string;
    avatar_url?: string;
    is_guest?: boolean;
}

/**
 * Custom hook for managing WebSocket connection to a board
 * Automatically reconnects on disconnect and handles real-time updates
 */
export const useBoardWebSocket = ({ boardId, onUpdate, onUserPresenceChange, enabled = true, currentUser }: UseBoardWebSocketOptions) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<number | undefined>(undefined);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;
    const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

    // Store callbacks in refs to avoid reconnecting when they change
    const onUpdateRef = useRef(onUpdate);
    const onUserPresenceChangeRef = useRef(onUserPresenceChange);
    const currentUserRef = useRef(currentUser);

    useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
    useEffect(() => { onUserPresenceChangeRef.current = onUserPresenceChange; }, [onUserPresenceChange]);
    useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

    const connect = useCallback(() => {
        if (!boardId || !enabled) return;

        // Close existing connection if any
        if (wsRef.current) {
            wsRef.current.close();
        }

        try {
            const wsUrl = `${import.meta.env.VITE_WS_URL}/v1/Hub/Boards/${boardId}/ws`;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                reconnectAttemptsRef.current = 0;

                if (currentUserRef.current) {
                    ws.send(JSON.stringify({
                        type: 'user_identify',
                        user: currentUserRef.current
                    }));
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);

                    switch (message.type) {
                        case 'connected':
                            if (currentUserRef.current && ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'user_identify',
                                    user: currentUserRef.current
                                }));
                            }
                            break;

                        case 'identified':
                            break;

                        case 'user_presence': {
                            const users = message.users || [];
                            setActiveUsers(users);
                            onUserPresenceChangeRef.current?.(users);
                            break;
                        }

                        case 'board_update':
                            onUpdateRef.current?.();
                            break;

                        case 'pong':
                            break;

                        case 'error':
                            break;

                        default:
                            break;
                    }
                } catch (error) {
                }
            };

            ws.onclose = (event) => {
                wsRef.current = null;
                setActiveUsers([]);

                if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts && enabled) {
                    reconnectAttemptsRef.current++;

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectDelay) as unknown as number;
                }
            };

        } catch (error) {
        }
    }, [boardId, enabled]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        if (wsRef.current) {
            wsRef.current.close(1000, 'Component unmounted');
            wsRef.current = null;
        }
        setActiveUsers([]);
    }, []);

    const sendMessage = useCallback((message: WebSocketMessage) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const notifyBoardChange = useCallback((action: string) => {
        sendMessage({
            type: 'board_changed',
            action,
            timestamp: new Date().toISOString()
        });
    }, [sendMessage]);

    // Setup heartbeat
    useEffect(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const heartbeatInterval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                sendMessage({ type: 'ping' });
            }
        }, 30000);

        return () => clearInterval(heartbeatInterval);
    }, [sendMessage]);

    // Connect on mount, disconnect on unmount
    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        activeUsers,
        sendMessage,
        notifyBoardChange,
        reconnect: connect
    };
};
