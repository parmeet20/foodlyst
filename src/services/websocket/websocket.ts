'use client';

import { ENV } from "@/config/envConfig";
import { WebSocketMessage } from "@/types/websocket";

let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;
const reconnectInterval = 3000;
let messageCallback: ((data: WebSocketMessage) => void) | null = null;
let currentParams: { lat: number; lng: number; token: string } | null = null;
let isManualClose = false;

export const initWebSocket = (latitude: number, longitude: number, token: string) => {
  // If same parameters and already connected/connecting, do nothing
  if (currentParams && 
      currentParams.lat === latitude && 
      currentParams.lng === longitude && 
      currentParams.token === token) {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected/connecting with same parameters');
      return;
    }
  }

  // Close existing connection if different parameters
  if (ws && (currentParams?.lat !== latitude || currentParams?.lng !== longitude || currentParams?.token !== token)) {
    console.log('Parameters changed, closing existing WebSocket');
    closeWebSocket();
  }

  currentParams = { lat: latitude, lng: longitude, token };
  isManualClose = false;
  
  const wsUrl = `${ENV.NEXT_PUBLIC_WS_URL}?token=${token}&lat=${latitude}&lng=${longitude}`;
  console.log('Creating WebSocket connection:', wsUrl);
  
  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        console.log('📨 WebSocket message received:', data);
        
        showBrowserNotification(data);
        
        if (messageCallback) {
          messageCallback(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔴 WebSocket disconnected:', event.code, event.reason);
      
      if (!isManualClose && reconnectAttempts < maxReconnectAttempts) {
        console.log(`🔄 Attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        setTimeout(() => {
          reconnectAttempts++;
          if (currentParams) {
            initWebSocket(currentParams.lat, currentParams.lng, currentParams.token);
          }
        }, reconnectInterval);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('❌ Max reconnection attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  } catch (error) {
    console.error('Failed to create WebSocket:', error);
  }
};

export const closeWebSocket = () => {
  isManualClose = true;
  if (ws) {
    console.log('Manually closing WebSocket connection');
    ws.close(1000, 'Manual closure');
    ws = null;
  }
  currentParams = null;
};

export const setMessageCallback = (callback: ((data: WebSocketMessage) => void) | null) => {
  messageCallback = callback;
};

export const getWebSocketState = () => {
  return ws ? ws.readyState : WebSocket.CLOSED;
};

export const isWebSocketConnected = () => {
  return ws && ws.readyState === WebSocket.OPEN;
};

const showBrowserNotification = async (data: WebSocketMessage) => {
    if (!('Notification' in window) || Notification.permission === 'denied') return;

    let title = '';
    let body = '';

    switch (data.type) {
        case 'NEW_OFFER':
            title = `New Offer from ${data.payload.restaurantName}`;
            body = data.payload.message;
            break;
        case 'ORDER_CONFIRMED':
            title = 'Order Confirmed';
            body = `Order #${data.payload.orderId}: ${data.payload.message}`;
            break;
        case 'NEW_ORDER':
            title = 'New Order Received';
            body = `Order #${data.payload.orderId}: ${data.payload.message} (Qty: ${data.payload.quantity})`;
            break;
        case 'FOOD_QUANTITY_UPDATED':
            title = 'Food Quantity Update';
            body = `${data.payload.foodName}: ${data.payload.remainingQty} remaining`;
            break;
        case 'GENERIC':
            title = 'Notification';
            body = data.payload.message;
            break;
    }

    if (title && body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/path/to/icon.png' });
        } else {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification(title, { body, icon: '/path/to/icon.png' });
            }
        }
    }
};