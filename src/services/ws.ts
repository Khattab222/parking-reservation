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

// Singleton WebSocket connection
class WebSocketService {
  private ws: WebSocket | null = null;
  private baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/v1/ws';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private subscribedGates = new Set<string>();
  private callbacks: Callbacks = {
    onConnected: null,
    onDisconnected: null,
    onZoneUpdate: null,
    onAdminUpdate: null,
  };

  // Ensure single connection
  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      this.ws = new WebSocket(this.baseUrl);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.callbacks.onConnected?.();
      
      // Resubscribe to all gates after reconnection
      this.subscribedGates.forEach(gateId => {
        this.sendMessage({ type: 'subscribe', payload: { gateId } });
      });
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event);
      this.callbacks.onDisconnected?.();
      
      // Only reconnect on abnormal closure
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'zone-update':
        // Update UI directly with server payload - no recalculation
        this.callbacks.onZoneUpdate?.(message.payload);
        break;
      case 'admin-update':
        this.callbacks.onAdminUpdate?.(message.payload);
        break;
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  private sendMessage(message: SubscribeMessage | UnsubscribeMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  subscribeToGate(gateId: string) {
    this.subscribedGates.add(gateId);
    this.sendMessage({ type: 'subscribe', payload: { gateId } });
  }

  unsubscribeFromGate(gateId: string) {
    this.subscribedGates.delete(gateId);
    this.sendMessage({ type: 'unsubscribe', payload: { gateId } });
  }

  disconnect() {
    // Unsubscribe from all gates before disconnecting
    this.subscribedGates.forEach(gateId => {
      this.sendMessage({ type: 'unsubscribe', payload: { gateId } });
    });
    this.subscribedGates.clear();
    
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    this.ws?.close(1000, 'Client disconnect');
    this.ws = null;
  }

  // Callback setters
  onConnected(callback: () => void) {
    this.callbacks.onConnected = callback;
  }

  onDisconnected(callback: () => void) {
    this.callbacks.onDisconnected = callback;
  }

  onZoneUpdate(callback: (zone: Zone) => void) {
    this.callbacks.onZoneUpdate = callback;
  }

  onAdminUpdate(callback: (update: AdminUpdateMessage['payload']) => void) {
    this.callbacks.onAdminUpdate = callback;
  }
}

// Export singleton instance
export const wsService = new WebSocketService();