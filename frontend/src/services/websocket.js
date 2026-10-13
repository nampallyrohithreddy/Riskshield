import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.threatFeedSubscribers = new Set();
    this.metricsSubscribers = new Set();
    this.statusSubscribers = new Set();
    this.connectionState = 'DISCONNECTED'; // CONNECTING, CONNECTED, DISCONNECTED, ERROR
    this.reconnectAttempts = 0;
  }

  connect(url) {
    if (this.client && this.client.active) {
      return;
    }

    const defaultUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/ws`
      : '/ws';
    const targetUrl = url || defaultUrl;

    this._updateState('CONNECTING');

    this.client = new Client({
      // Using webSocketFactory with SockJS for resilient fallback
      webSocketFactory: () => new SockJS(targetUrl),
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // Uncomment for deep socket debugging
        // console.debug('[STOMP]', str);
      },
    });

    this.client.onConnect = (frame) => {
      this.reconnectAttempts = 0;
      this._updateState('CONNECTED');
      console.log('✅ RiskShield STOMP WebSocket connected.');

      // Subscribe to real-time evaluated transaction feed
      this.client.subscribe('/topic/threat-feed', (message) => {
        try {
          const payload = JSON.parse(message.body);
          this.threatFeedSubscribers.forEach((cb) => cb(payload));
        } catch (err) {
          console.error('Error parsing threat feed message:', err);
        }
      });

      // Subscribe to real-time engine metrics feed
      this.client.subscribe('/topic/metrics', (message) => {
        try {
          const payload = JSON.parse(message.body);
          this.metricsSubscribers.forEach((cb) => cb(payload));
        } catch (err) {
          console.error('Error parsing metrics message:', err);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.warn('STOMP protocol error:', frame.headers['message']);
      this._updateState('ERROR');
    };

    this.client.onWebSocketClose = () => {
      this.reconnectAttempts++;
      this._updateState('DISCONNECTED');
    };

    this.client.onWebSocketError = (event) => {
      this._updateState('ERROR');
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this._updateState('DISCONNECTED');
    }
  }

  _updateState(state) {
    this.connectionState = state;
    this.statusSubscribers.forEach((cb) => cb(state));
  }

  onThreatFeed(callback) {
    this.threatFeedSubscribers.add(callback);
    return () => this.threatFeedSubscribers.delete(callback);
  }

  onMetrics(callback) {
    this.metricsSubscribers.add(callback);
    return () => this.metricsSubscribers.delete(callback);
  }

  onStatusChange(callback) {
    this.statusSubscribers.add(callback);
    callback(this.connectionState);
    return () => this.statusSubscribers.delete(callback);
  }

  getConnectionState() {
    return this.connectionState;
  }
}

export const wsService = new WebSocketService();
export default wsService;
