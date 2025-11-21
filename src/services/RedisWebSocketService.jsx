import { getDbHttpsUrl } from '../context/NgrokAPIStore';

class RedisWebSocketService {
  constructor() {
    this.ws = null;
    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  connect(userId, avatarId, accessToken) {
    // Close existing connection if any
    this.disconnect();

    // Build WebSocket URL
    const baseUrl = getDbHttpsUrl()
      .replace('https://', 'wss://')
      .replace('http://', 'ws://');
    const wsUrl = `${baseUrl}/ws/chat/${userId}/${avatarId}?token=${accessToken}`;

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ Redis WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received AI response via WebSocket:', data);

        // Notify all registered callbacks
        this.messageCallbacks.forEach((callback) => callback(data));
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    this.ws.onclose = (event) => {
      console.log(`WebSocket closed (code: ${event.code})`);
      this.attemptReconnect(userId, avatarId, accessToken);
    };
  }

  attemptReconnect(userId, avatarId, accessToken) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.connect(userId, avatarId, accessToken);
    }, delay);
  }

  onMessage(callback) {
    if (typeof callback === 'function') {
      this.messageCallbacks.push(callback);
    }
  }

  removeMessageListener(callback) {
    this.messageCallbacks = this.messageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnection
      this.ws.close();
      this.ws = null;
    }

    this.messageCallbacks = [];
    this.reconnectAttempts = 0;
    console.log('WebSocket disconnected');
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

export default new RedisWebSocketService();
