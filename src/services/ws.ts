import { Zone } from '@/types';

type SubscribeMessage = {
  type: 'subscribe';
  payload: { gateId: string };
};

type UnsubscribeMessage = {
  type: 'unsubscribe';
  payload: { gateId: string };
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

type WebSocketMessage = SubscribeMessage | UnsubscribeMessage | ZoneUpdateMessage | AdminUpdateMessage;

type Callbacks = {
  onConnected: (() => void) | null;
  onDisconnected: (() => void) | null;
  onZoneUpdate: ((zone: Zone) => void) | null;
  onAdminUpdate: ((update: AdminUpdateMessage['payload']) => void) | null;
};

const BASE_URL = 'http://localhost:3000/api/v1/ws';
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
let currentGateId: string | null = null;
const maxReconnectAttempts = 5;
const reconnectTimeout = 1000;
const callbacks: Callbacks = {
  onConnected: null,
  onDisconnected: null,
  onZoneUpdate: null,
  onAdminUpdate: null,
};

function handleMessage(message: WebSocketMessage) {
  switch (message.type) {
    case 'zone-update':
      callbacks.onZoneUpdate?.(message.payload);
      break;
    case 'admin-update':
      callbacks.onAdminUpdate?.(message.payload);
      break;
  }
}

function handleReconnect() {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    setTimeout(() => connect(), reconnectTimeout * reconnectAttempts);
  }
}

function setupEventListeners() {
  if (!ws) return;

  ws.onopen = () => {
    console.log('WebSocket connected');
    reconnectAttempts = 0;
    callbacks.onConnected?.();
    if (currentGateId) {
      subscribeToGate(currentGateId); // Resubscribe on reconnect
    }
  };

  ws.onclose = () => {
    console.log('WebSocket closed');
    callbacks.onDisconnected?.();
    handleReconnect();
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onmessage = (event) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      handleMessage(message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
}

function sendMessage(message: WebSocketMessage) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function connect() {
  try {
    ws = new WebSocket(BASE_URL);
    setupEventListeners();
  } catch (error) {
    console.error('WebSocket connection error:', error);
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

function disconnect() {
  if (currentGateId) {
    unsubscribeFromGate(currentGateId);
  }
  ws?.close();
  ws = null;
}

export const wsService = {
  connect,
  disconnect,
  subscribeToGate,
  unsubscribeFromGate,
  onConnected: (callback: () => void) => { callbacks.onConnected = callback; },
  onDisconnected: (callback: () => void) => { callbacks.onDisconnected = callback; },
  onZoneUpdate: (callback: (zone: Zone) => void) => { callbacks.onZoneUpdate = callback; },
  onAdminUpdate: (callback: (update: AdminUpdateMessage['payload']) => void) => { callbacks.onAdminUpdate = callback; },
};