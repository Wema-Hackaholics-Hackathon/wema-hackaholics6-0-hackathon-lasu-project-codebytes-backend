"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  MessageSquare,
  Users,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Smile,
  Frown,
} from "lucide-react";
import type { DashboardStats } from "@/lib/types/api";
import {
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

const COLORS = [
  "#7C3AED",
  "#EC4899",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

const getSentimentEmoji = (sentiment: string) => {
  const emojiMap: Record<string, string> = {
    very_positive: "😍",
    positive: "😊",
    neutral: "😐",
    negative: "😟",
    very_negative: "😡",
  };
  return emojiMap[sentiment] || "😐";
};

const getSentimentColor = (sentiment: string) => {
  const colorMap: Record<string, string> = {
    very_positive: "text-green-600 bg-green-50 border-green-200",
    positive: "text-green-500 bg-green-50 border-green-200",
    neutral: "text-gray-600 bg-gray-50 border-gray-200",
    negative: "text-orange-600 bg-orange-50 border-orange-200",
    very_negative: "text-red-600 bg-red-50 border-red-200",
  };
  return colorMap[sentiment] || "text-gray-600 bg-gray-50 border-gray-200";
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load analytics:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  // Prepare chart data
  const sentimentChartData = stats
    ? Object.entries(stats.sentimentBreakdown).map(([key, value]) => ({
        name: key.replace(/_/g, " "),
        value: value as number,
        emoji: getSentimentEmoji(key),
      }))
    : [];

  const channelChartData = stats
    ? stats.channelPerformance.map((channel) => ({
        name: channel.channel.replace(/_/g, " "),
        count: channel.count,
        rating: channel.averageRating,
      }))
    : [];

  const totalFeedback = stats
    ? Object.values(stats.sentimentBreakdown).reduce(
        (sum: number, val) => sum + (val as number),
        0
      )
    : 0;

  const positiveCount = stats
    ? (stats.sentimentBreakdown.very_positive || 0) +
      (stats.sentimentBreakdown.positive || 0)
    : 0;

  const negativeCount = stats
    ? (stats.sentimentBreakdown.very_negative || 0) +
      (stats.sentimentBreakdown.negative || 0)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          Detailed insights and trends with sentiment analysis
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Feedback
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalFeedback.toLocaleString()}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {positiveCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((positiveCount / totalFeedback) * 100 || 0).toFixed(0)}%
              </p>
            </div>
            <ThumbsUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Negative</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {negativeCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((negativeCount / totalFeedback) * 100 || 0).toFixed(0)}%
              </p>
            </div>
            <ThumbsDown className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Channels</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.channelPerformance.length || 0}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sentiment Distribution Pie Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sentiment Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={sentimentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent, emoji }) =>
                    `${emoji} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: string, props: any) => [
                    `${value} feedbacks ${props.payload.emoji}`,
                    props.payload.name,
                  ]}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </RechartsPie>
            </ResponsiveContainer>
          </div>

          {/* Channel Performance Bar Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Channel Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#7C3AED"
                  name="Responses"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="rating"
                  fill="#F59E0B"
                  name="Avg Rating"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Sentiment Breakdown Cards */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Sentiment Breakdown
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats?.sentimentBreakdown || {}).map(
            ([key, value]) => (
              <div
                key={key}
                className={`text-center p-4 rounded-lg border ${getSentimentColor(
                  key
                )}`}
              >
                <div className="text-4xl mb-2">{getSentimentEmoji(key)}</div>
                <p className="text-2xl font-semibold">{value as number}</p>
                <p className="text-xs font-medium mt-1 capitalize">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {(((value as number) / totalFeedback) * 100 || 0).toFixed(1)}%
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Trending Topics
          </h2>
        </div>
        <div className="space-y-2">
          {stats?.trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-purple-600">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {topic.topic}
                </span>
              </div>
              <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                {topic.count} mentions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
