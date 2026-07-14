import { useEffect, useRef, useState, useCallback } from "react";
import type { ChatMessage } from "./types";

const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

interface ChatWebSocketEvents {
    onNewMessage?: (message: ChatMessage) => void;
    onTyping?: (data: { chat_id: string; user_id: string; is_typing: boolean }) => void;
    onMessageRead?: (data: { chat_id: string; user_id: string; message_id: string }) => void;
    onMemberAdded?: (data: { chat_id: string; user: any }) => void;
    onMemberRemoved?: (data: { chat_id: string; user_id: string }) => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
}

export function useChatWebSocket(userId: string | null, events: ChatWebSocketEvents = {}) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        if (!userId) return;

        const ws = new WebSocket(`${WS_BASE}/v1/Hub/ws/chat`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("[Chat WS] Connected");
            // Authenticate with the session token — the server derives identity
            // from it (client-supplied user_id is no longer trusted).
            ws.send(JSON.stringify({
                type: "identify",
                token: localStorage.getItem("token"),
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "connected":
                        setIsConnected(true);
                        reconnectAttemptsRef.current = 0;
                        events.onConnected?.();
                        break;

                    case "new_message":
                        events.onNewMessage?.(data.message);
                        break;

                    case "typing":
                        events.onTyping?.(data);
                        break;

                    case "message_read":
                        events.onMessageRead?.(data);
                        break;

                    case "member_added":
                        events.onMemberAdded?.(data);
                        break;

                    case "member_removed":
                        events.onMemberRemoved?.(data);
                        break;

                    case "pong":
                        // Keepalive response
                        break;

                    case "error":
                        console.error("[Chat WS] Error:", data.message);
                        break;

                    default:
                        console.log("[Chat WS] Unknown message:", data);
                }
            } catch (err) {
                console.error("[Chat WS] Failed to parse message:", err);
            }
        };

        ws.onerror = (error) => {
            console.error("[Chat WS] Error:", error);
        };

        ws.onclose = () => {
            console.log("[Chat WS] Disconnected");
            setIsConnected(false);
            events.onDisconnected?.();

            // Attempt reconnection
            if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current++;
                console.log(`[Chat WS] Reconnecting in ${delay}ms...`);
                reconnectTimeoutRef.current = setTimeout(connect, delay);
            }
        };
    }, [userId, events]);

    // Connect on mount
    useEffect(() => {
        connect();

        // Heartbeat every 30 seconds
        const heartbeatInterval = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);

        return () => {
            clearInterval(heartbeatInterval);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsRef.current?.close();
        };
    }, [connect]);

    // Send typing indicator
    const sendTyping = useCallback((chatId: string, isTyping: boolean) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: isTyping ? "typing_start" : "typing_stop",
                chat_id: chatId,
            }));
        }
    }, []);

    // Mark message as read
    const markRead = useCallback((chatId: string, messageId: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: "mark_read",
                chat_id: chatId,
                message_id: messageId,
            }));
        }
    }, []);

    return {
        isConnected,
        sendTyping,
        markRead,
    };
}
