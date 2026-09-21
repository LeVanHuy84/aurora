import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { tokenStorage } from './token-storage';

const getDefaultSocketUrl = () => {
  // Lấy IP của máy chủ dev từ Expo Constants nếu có (hỗ trợ test trên máy thật / 2 thiết bị cùng mạng LAN)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

const getSocketBaseUrl = () => {
  const socketEnvUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (socketEnvUrl) {
    return socketEnvUrl.replace(/\/+$/, '');
  }

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const parsed = new URL(apiUrl);
      return parsed.origin;
    } catch {
      return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    }
  }

  return getDefaultSocketUrl();
};

type SocketEventHandler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private activeConversationId: string | null = null;
  private eventListeners: Map<string, Set<SocketEventHandler>> = new Map();

  /**
   * Khởi tạo và kết nối WebSocket với JWT Token
   */
  async connect(customToken?: string): Promise<Socket | null> {
    const token = customToken || (await tokenStorage.getAccessToken());

    if (!token) {
      this.disconnect();
      return null;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const socketUrl = getSocketBaseUrl();
    console.log('⚡ Connecting WebSocket to:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    // Gắn lại toàn bộ event listeners đã đăng ký
    this.eventListeners.forEach((handlers, event) => {
      handlers.forEach((handler) => {
        this.socket?.on(event, handler);
      });
    });

    this.socket.on('connect', () => {
      console.log('⚡ Socket.io connected successfully:', this.socket?.id);
      // Tự động rejoin lại conversation nếu đang ở trong phòng chat
      if (this.activeConversationId) {
        console.log('⚡ Re-joining conversation room:', this.activeConversationId);
        this.socket?.emit('join_conversation', {
          conversationId: this.activeConversationId,
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.warn('⚠️ Socket.io connection error:', error.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
    });

    return this.socket;
  }

  /**
   * Ngắt kết nối socket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeConversationId = null;
  }

  /**
   * Lấy socket hiện tại
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Đăng ký lắng nghe sự kiện an toàn (ngay cả trước khi socket kết nối)
   */
  on(event: string, handler: SocketEventHandler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(handler);

    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Hủy lắng nghe sự kiện
   */
  off(event: string, handler: SocketEventHandler) {
    this.eventListeners.get(event)?.delete(handler);
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Tham gia vào phòng chat cụ thể
   */
  joinConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    if (this.socket?.connected) {
      console.log('⚡ Emitting join_conversation for:', conversationId);
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  /**
   * Rời khỏi phòng chat
   */
  leaveConversation(conversationId: string) {
    if (this.activeConversationId === conversationId) {
      this.activeConversationId = null;
    }
    if (this.socket?.connected) {
      console.log('⚡ Emitting leave_conversation for:', conversationId);
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  /**
   * Gửi trạng thái đang gõ phím
   */
  sendTyping(conversationId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }
}

export const socketService = new SocketService();
