"use client";

import { useEffect, useCallback, useRef } from "react";
import wsClient from "@/lib/websocket-client";

interface UseRealtimeUpdatesOptions {
  onFeedback?: (data: any) => void;
  onAlert?: (data: any) => void;
  onMetricUpdate?: (data: any) => void;
  onSentimentUpdate?: (data: any) => void;
  onChannelUpdate?: (data: any) => void;
  onErrorReport?: (data: any) => void;
  autoConnect?: boolean;
  subscribeToAlerts?: boolean;
  subscribeToDashboard?: boolean;
  subscribeToErrors?: boolean;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const {
    onFeedback,
    onAlert,
    onMetricUpdate,
    onSentimentUpdate,
    onChannelUpdate,
    onErrorReport,
    autoConnect = true,
    subscribeToAlerts = false,
    subscribeToDashboard = false,
    subscribeToErrors = false,
  } = options;

  const isConnecting = useRef(false);

  const connect = useCallback(async () => {
    if (isConnecting.current || wsClient.isConnected()) {
      return;
    }

    isConnecting.current = true;
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      await wsClient.connect(token || undefined);

      // Subscribe to specific channels
      if (subscribeToAlerts) {
        wsClient.subscribeToAlerts();
      }
      if (subscribeToDashboard) {
        wsClient.subscribeToDashboard();
      }
      if (subscribeToErrors) {
        wsClient.subscribeToErrors();
      }
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    } finally {
      isConnecting.current = false;
    }
  }, [subscribeToAlerts, subscribeToDashboard, subscribeToErrors]);

  const disconnect = useCallback(() => {
    wsClient.disconnect();
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Set up event listeners
    if (onFeedback) wsClient.on("feedback", onFeedback);
    if (onAlert) wsClient.on("alert", onAlert);
    if (onMetricUpdate) wsClient.on("metric_update", onMetricUpdate);
    if (onSentimentUpdate) wsClient.on("sentiment_update", onSentimentUpdate);
    if (onChannelUpdate) wsClient.on("channel_update", onChannelUpdate);
    if (onErrorReport) wsClient.on("error_report", onErrorReport);

    return () => {
      // Clean up event listeners
      if (onFeedback) wsClient.off("feedback", onFeedback);
      if (onAlert) wsClient.off("alert", onAlert);
      if (onMetricUpdate) wsClient.off("metric_update", onMetricUpdate);
      if (onSentimentUpdate)
        wsClient.off("sentiment_update", onSentimentUpdate);
      if (onChannelUpdate) wsClient.off("channel_update", onChannelUpdate);
      if (onErrorReport) wsClient.off("error_report", onErrorReport);
    };
  }, [
    autoConnect,
    connect,
    onFeedback,
    onAlert,
    onMetricUpdate,
    onSentimentUpdate,
    onChannelUpdate,
    onErrorReport,
  ]);

  return {
    isConnected: wsClient.isConnected(),
    connect,
    disconnect,
    connectionId: wsClient.connectionId,
  };
}
