// src/components/WebSocketProvider.tsx
'use client';

import { closeWebSocket, initWebSocket, setMessageCallback, getWebSocketState } from '@/services/websocket/websocket';
import { useAuthStore } from '@/store/userStore';
import { WebSocketMessage } from '@/types/websocket';
import { useEffect, useRef } from 'react';

// Create a global event system for WebSocket messages
const listeners = new Set<(data: WebSocketMessage) => void>();

export const addWebSocketListener = (callback: (data: WebSocketMessage) => void) => {
    listeners.add(callback);
};

export const removeWebSocketListener = (callback: (data: WebSocketMessage) => void) => {
    listeners.delete(callback);
};

const notifyAllListeners = (data: WebSocketMessage) => {
    listeners.forEach(callback => {
        try {
            callback(data);
        } catch (error) {
            console.error('Error in WebSocket listener:', error);
        }
    });
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, token } = useAuthStore();
    const wsInitialized = useRef(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        // Set up the global message callback once
        setMessageCallback(notifyAllListeners);

        return () => {
            setMessageCallback(null);
        };
    }, []);

    useEffect(() => {
        const initializeWebSocket = () => {
            // Don't initialize if already connected/connecting or missing credentials
            if (wsInitialized.current || !user || !user.latitude || !user.longitude || !token) {
                return;
            }

            const currentState = getWebSocketState();
            if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
                console.log('WebSocket already connected/connecting');
                wsInitialized.current = true;
                return;
            }

            console.log('Initializing WebSocket connection...');
            initWebSocket(user.latitude, user.longitude, token);
            wsInitialized.current = true;

            if ('Notification' in window && Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
        };

        const cleanupWebSocket = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            wsInitialized.current = false;
            // Don't close WebSocket here - let the service handle reconnections
        };

        initializeWebSocket();

        return cleanupWebSocket;
    }, [user, token]);

    // Re-initialize WebSocket when user location changes significantly
    useEffect(() => {
        if (user?.latitude && user?.longitude && token) {
            // Debounced reconnection when location changes
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            reconnectTimeoutRef.current = setTimeout(() => {
                if (wsInitialized.current) {
                    console.log('Location changed, reinitializing WebSocket...');
                    wsInitialized.current = false;
                    closeWebSocket();
                    setTimeout(() => {
                        initWebSocket(user.latitude!, user.longitude!, token);
                        wsInitialized.current = true;
                    }, 1000);
                }
            }, 2000);
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [user?.latitude, user?.longitude, token]);

    return <>{children}</>;
};