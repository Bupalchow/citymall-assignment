import { io } from 'socket.io-client';
import { getCurrentUser } from './auth';
const SOCKET_URL = 'https://citymall-assignment-backend.onrender.com';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    const user = getCurrentUser();
    if (!user) return;

    this.socket = io(SOCKET_URL, {
      query: {
        userId: user.id,
        username: user.username
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });
    
    this.socket.on('bid_update', (data) => {
      if (this.listeners.has('bid_update')) {
        this.listeners.get('bid_update').forEach(callback => callback(data));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
  
  emitBid(memeId, amount) {
    if (!this.socket || !this.isConnected) return;
    
    const user = getCurrentUser();
    if (!user) return;

    this.socket.emit('new_bid', {
      memeId,
      userId: user.id,
      username: user.username,
      amount: parseFloat(amount),
      timestamp: new Date().toISOString()
    });
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
}

const socketService = new SocketService();
export default socketService;
