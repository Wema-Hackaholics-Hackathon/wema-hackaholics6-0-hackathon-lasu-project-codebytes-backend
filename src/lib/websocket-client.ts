"use client";

import { io, Socket } from "socket.io-client";
import {
  WebSocketEvent,
  NewFeedbackEvent,
  NewAlertEvent,
  MetricUpdateEvent,
} from "./types/api";

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(
    private url: string = process.env.NEXT_PUBLIC_WS_URL ||
      "http://localhost:4000"
  ) {
    console.log("WebSocket Client initialized with URL:", this.url);
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // Don't attempt connection if backend is not available
      if (process.env.NEXT_PUBLIC_ENABLE_REALTIME === "false") {
        console.log("Real-time updates disabled");
        reject(new Error("Real-time disabled"));
        return;
      }

      console.log("Attempting WebSocket connection to:", this.url);

      try {
        this.socket = io(this.url, {
          auth: token ? { token } : undefined,
          transports: ["websocket", "polling"],
          timeout: 10000,
          forceNew: true,
          upgrade: true,
          rememberUpgrade: true,
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        this.socket.on("connect", () => {
          console.log("✅ WebSocket connected:", this.socket?.id);
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.warn(
            "⚠️ WebSocket connection error (backend may be offline):",
            error.message
          );
          // Don't reject immediately - allow app to work without WebSocket
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        this.socket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
        });

        // Handle real-time events
        this.socket.on("feedback", (data: NewFeedbackEvent["data"]) => {
          this.emit("feedback", data);
        });

        this.socket.on("alert", (data: NewAlertEvent["data"]) => {
          this.emit("alert", data);
        });

        this.socket.on("metric_update", (data: MetricUpdateEvent["data"]) => {
          this.emit("metric_update", data);
        });

        this.socket.on("sentiment_update", (data: any) => {
          this.emit("sentiment_update", data);
        });

        this.socket.on("channel_update", (data: any) => {
          this.emit("channel_update", data);
        });

        this.socket.on("error_report", (data: any) => {
          this.emit("error_report", data);
        });
      } catch (error) {
        console.error("Failed to initialize WebSocket:", error);
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect().catch(() => {
          console.log(
            "Reconnection attempt failed, app running in offline mode"
          );
        });
      }, delay);
    } else {
      console.warn(
        "⚠️ Max reconnection attempts reached - app running in offline mode (real-time updates disabled)"
      );
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Subscribe to dashboard updates
  subscribeToDashboard(): void {
    if (this.socket?.connected) {
      this.socket.emit("subscribe", "dashboard");
    }
  }

  // Subscribe to specific channel updates
  subscribeToChannel(channel: string): void {
    if (this.socket?.connected) {
      this.socket.emit("subscribe", `channel:${channel}`);
    }
  }

  // Subscribe to alert updates
  subscribeToAlerts(): void {
    if (this.socket?.connected) {
      this.socket.emit("subscribe", "alerts");
    }
  }

  // Subscribe to error tracking
  subscribeToErrors(): void {
    if (this.socket?.connected) {
      this.socket.emit("subscribe", "errors");
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Error in WebSocket event handler for ${event}:`,
            error
          );
        }
      });
    }
  }

  // Send real-time feedback
  sendFeedback(feedback: any): void {
    if (this.socket?.connected) {
      this.socket.emit("new_feedback", feedback);
    }
  }

  // Send error report
  reportError(error: any): void {
    if (this.socket?.connected) {
      this.socket.emit("error_report", error);
    }
  }

  // Get connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get connectionId(): string | undefined {
    return this.socket?.id;
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient();
export default wsClient;
