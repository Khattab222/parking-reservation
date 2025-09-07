// services/ws.ts
import { Zone } from '@/types';

type SubscribeMessage = {
  type: 'subscribe';
  payload: { gateId: string };
};

type UnsubscribeMessage = {
  type: 'unsubscribe';
  payload: { gateId: string };
};

type SubscribeAdminMessage = {
  type: 'subscribe-admin';
  payload: { adminId: string };
};

type UnsubscribeAdminMessage = {
  type: 'unsubscribe-admin';
  payload: { adminId: string };
};

type ZoneUpdateMessage = {
  type: 'zone-update';
  payload: Zone;
};

type AdminUpdateMessage = {
  type: 'admin-update';
  payload: {
    adminId: string;
    action: 'category-rates-changed' | 'zone-closed' | 'zone-opened' | 'vacation-added' | 'rush-updated';
    targetType: 'category' | 'zone' | 'vacation' | 'rush';
    targetId: string;
    details?: any;
    timestamp: string;
  };
};

// Add outgoing admin update message type
type SendAdminUpdateMessage = {
  type: 'admin-action';
  payload: {
    action: 'category-rates-changed' | 'zone-closed' | 'zone-opened' | 'vacation-added' | 'rush-updated';
    targetType: 'category' | 'zone' | 'vacation' | 'rush';
    targetId: string;
    details?: any;
  };
};

type WebSocketMessage = 
  | SubscribeMessage 
  | UnsubscribeMessage 
  | SubscribeAdminMessage
  | UnsubscribeAdminMessage
  | ZoneUpdateMessage 
  | AdminUpdateMessage
  | SendAdminUpdateMessage;

type Callbacks = {
  onConnected: (() => void) | null;
  onDisconnected: (() => void) | null;
  onZoneUpdate: ((zone: Zone) => void) | null;
  onAdminUpdate: ((update: AdminUpdateMessage['payload']) => void) | null;
  onError: ((error: any) => void) | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/v1/ws';
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let currentGateId: string | null = null;
let currentAdminId: string | null = null;
let isAdminSubscribed = false;
const maxReconnectAttempts = 5;
const reconnectTimeout = 1000;
const callbacks: Callbacks = {
  onConnected: null,
  onDisconnected: null,
  onZoneUpdate: null,
  onAdminUpdate: null,
  onError: null,
};

// Queue for messages to be sent when connection is established
const messageQueue: WebSocketMessage[] = [];

function handleMessage(message: WebSocketMessage) {
  console.log('WebSocket message received:', message);
  
  switch (message.type) {
    case 'zone-update':
      callbacks.onZoneUpdate?.(message.payload);
      break;
    case 'admin-update':
      callbacks.onAdminUpdate?.(message.payload);
      break;
    default:
      console.log('Unknown message type:', message);
  }
}

function handleReconnect() {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`);
    setTimeout(() => connect(), reconnectTimeout * reconnectAttempts);
  } else {
    console.error('Max reconnection attempts reached');
    callbacks.onError?.('Failed to reconnect to WebSocket server');
  }
}

function processMessageQueue() {
  while (messageQueue.length > 0 && ws?.readyState === WebSocket.OPEN) {
    const message = messageQueue.shift();
    if (message) {
      ws.send(JSON.stringify(message));
    }
  }
}

function setupEventListeners() {
  if (!ws) return;

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    callbacks.onConnected?.();
    
    // Resubscribe on reconnect
    if (currentGateId) {
      subscribeToGate(currentGateId);
    }
    if (isAdminSubscribed && currentAdminId) {
      subscribeToAdminUpdates(currentAdminId);
    }
    
    // Process any queued messages
    processMessageQueue();
  };

  ws.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    callbacks.onDisconnected?.();
    
    // Only reconnect if it wasn't a normal closure
    if (event.code !== 1000) {
      handleReconnect();
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    callbacks.onError?.(error);
  };

  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      callbacks.onError?.(error);
    }
  };
}

function sendMessage(message: WebSocketMessage) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    // Queue message if connection is not open
    messageQueue.push(message);
    console.log('Message queued, WebSocket not ready');
    
    // Try to reconnect if disconnected
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      connect();
    }
  }
}

function connect() {
  try {
    // Don't create a new connection if one is already connecting
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      return;
    }
    
    ws = new WebSocket(BASE_URL);
    setupEventListeners();
  } catch (error) {
    console.error('WebSocket connection error:', error);
    callbacks.onError?.(error);
    handleReconnect();
  }
}

function subscribeToGate(gateId: string) {
  currentGateId = gateId;
  sendMessage({
    type: 'subscribe',
    payload: { gateId }
  });
}

function unsubscribeFromGate(gateId: string) {
  if (currentGateId === gateId) {
    currentGateId = null;
  }
  sendMessage({
    type: 'unsubscribe',
    payload: { gateId }
  });
}

function subscribeToAdminUpdates(adminId: string) {
  currentAdminId = adminId;
  isAdminSubscribed = true;
  sendMessage({
    type: 'subscribe-admin',
    payload: { adminId }
  });
}

function unsubscribeFromAdminUpdates(adminId: string) {
  if (currentAdminId === adminId) {
    currentAdminId = null;
    isAdminSubscribed = false;
  }
  sendMessage({
    type: 'unsubscribe-admin',
    payload: { adminId }
  });
}

// Method to send admin updates (if client needs to notify server of admin actions)
function sendAdminAction(action: SendAdminUpdateMessage['payload']) {
  sendMessage({
    type: 'admin-action',
    payload: action
  });
}

function disconnect() {
  if (currentGateId) {
    unsubscribeFromGate(currentGateId);
  }
  if (currentAdminId) {
    unsubscribeFromAdminUpdates(currentAdminId);
  }
  
  reconnectAttempts = maxReconnectAttempts; // Prevent auto-reconnect on manual disconnect
  ws?.close(1000, 'Client disconnect'); // Normal closure
  ws = null;
  messageQueue.length = 0; // Clear message queue
}

// Get connection status
function getConnectionState() {
  if (!ws) return 'disconnected';
  switch (ws.readyState) {
    case WebSocket.CONNECTING: return 'connecting';
    case WebSocket.OPEN: return 'connected';
    case WebSocket.CLOSING: return 'closing';
    case WebSocket.CLOSED: return 'disconnected';
    default: return 'unknown';
  }
}

export const wsService = {
  connect,
  disconnect,
  subscribeToGate,
  unsubscribeFromGate,
  subscribeToAdminUpdates,
  unsubscribeFromAdminUpdates,
  sendAdminAction,
  getConnectionState,
  onConnected: (callback: () => void) => { callbacks.onConnected = callback; },
  onDisconnected: (callback: () => void) => { callbacks.onDisconnected = callback; },
  onZoneUpdate: (callback: (zone: Zone) => void) => { callbacks.onZoneUpdate = callback; },
  onAdminUpdate: (callback: (update: AdminUpdateMessage['payload']) => void) => { callbacks.onAdminUpdate = callback; },
  onError: (callback: (error: any) => void) => { callbacks.onError = callback; },
};