"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  MessageSquare,
  AlertCircle,
  Star,
  TrendingUp,
  Wifi,
} from "lucide-react";
import type { DashboardStats as ApiDashboardStats } from "@/lib/types/api";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { useToast } from "@/contexts/toast-context";

interface DashboardStats {
  totalFeedback: number;
  totalAlerts: number;
  averageRating: number;
  sentimentScore: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFeedback: 0,
    totalAlerts: 0,
    averageRating: 0,
    sentimentScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Handle real-time updates
  const handleNewFeedback = useCallback(
    (data: any) => {
      toast.info("New Feedback", `New ${data.channel} feedback received`);
      loadDashboardData(); // Refresh stats
    },
    [toast]
  );

  const handleNewAlert = useCallback(
    (data: any) => {
      toast.warning("New Alert", `${data.severity} alert: ${data.title}`);
      loadDashboardData(); // Refresh stats
    },
    [toast]
  );

  const handleMetricUpdate = useCallback((data: any) => {
    console.log("Metric update received:", data);
    loadDashboardData(); // Refresh stats
  }, []);

  // WebSocket connection
  const { isConnected } = useRealtimeUpdates({
    onFeedback: handleNewFeedback,
    onAlert: handleNewAlert,
    onMetricUpdate: handleMetricUpdate,
    subscribeToDashboard: true,
    subscribeToAlerts: true,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data: ApiDashboardStats = await apiClient.getDashboardStats();

      // Calculate sentiment score from breakdown
      const sentimentBreakdown = data.sentimentBreakdown;
      const total = Object.values(sentimentBreakdown).reduce(
        (a, b) => a + b,
        0
      );
      const positiveCount =
        sentimentBreakdown.very_positive + sentimentBreakdown.positive;
      const sentimentScore = total > 0 ? positiveCount / total : 0;

      setStats({
        totalFeedback: data.totalFeedback || 0,
        totalAlerts: data.recentAlerts?.length || 0,
        averageRating: data.averageRating || 0,
        sentimentScore: sentimentScore,
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load dashboard stats:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Customer experience metrics overview
            </p>
          </div>
          {/* Real-time connection status */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Wifi
                className={`w-3.5 h-3.5 ${isConnected ? "animate-pulse" : ""}`}
              />
              {isConnected ? "Live" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Total Feedback
            </h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalFeedback.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Alerts</h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.totalAlerts.toLocaleString()}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Average Rating
            </h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {stats.averageRating.toFixed(1)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Positive Sentiment
            </h3>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {Math.round(stats.sentimentScore * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
