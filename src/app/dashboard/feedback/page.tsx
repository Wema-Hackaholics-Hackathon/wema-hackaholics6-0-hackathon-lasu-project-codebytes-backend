"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  MessageSquare,
  Search,
  Filter,
  Star,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { Feedback, FeedbackChannel } from "@/lib/types/api";
import {
  BarChart,
  Bar,
  PieChart,
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
} from "recharts";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<FeedbackChannel | "ALL">(
    "ALL"
  );

  useEffect(() => {
    loadFeedback();
  }, [channelFilter]);

  const loadFeedback = async () => {
    try {
      const filters =
        channelFilter !== "ALL" ? { channel: channelFilter } : undefined;
      const response = await apiClient.getFeedback(filters, 1, 50);
      setFeedback(response.items);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load feedback:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedback = feedback.filter((item) =>
    item.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalFeedback = feedback.length;
  const avgRating =
    feedback.reduce((sum, item) => sum + (item.rating || 0), 0) /
    (feedback.filter((item) => item.rating).length || 1);
  const positiveCount = feedback.filter(
    (item) =>
      item.sentimentAnalysis?.sentimentScore &&
      item.sentimentAnalysis.sentimentScore > 0.6
  ).length;
  const negativeCount = feedback.filter(
    (item) =>
      item.sentimentAnalysis?.sentimentScore &&
      item.sentimentAnalysis.sentimentScore < 0.4
  ).length;

  // Channel distribution
  const channelData = Object.entries(
    feedback.reduce((acc: any, item) => {
      acc[item.channel] = (acc[item.channel] || 0) + 1;
      return acc;
    }, {})
  ).map(([channel, count]) => ({
    name: channel.replace(/_/g, " "),
    value: count as number,
  }));

  // Rating distribution
  const ratingData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}★`,
    count: feedback.filter((item) => item.rating === rating).length,
  }));

  const COLORS = [
    "#7C3AED",
    "#EC4899",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "very_positive":
        return "text-green-600 bg-green-50";
      case "positive":
        return "text-green-600 bg-green-50";
      case "neutral":
        return "text-gray-600 bg-gray-50";
      case "negative":
        return "text-red-600 bg-red-50";
      case "very_negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Feedback</h1>
        <p className="mt-1 text-sm text-gray-600">
          View and manage customer feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Feedback
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalFeedback}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {avgRating.toFixed(1)}
              </p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(avgRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
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
      </div>

      {/* Charts Section */}
      {feedback.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Channel Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Feedback by Channel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rating Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">All Channels</option>
              <option value="IN_APP_SURVEY">In-App Survey</option>
              <option value="CHATBOT">Chatbot</option>
              <option value="VOICE_CALL">Voice Call</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="EMAIL">Email</option>
              <option value="WEB_FORM">Web Form</option>
              <option value="SMS">SMS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No feedback found</p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                    {item.channel.replace(/_/g, " ")}
                  </span>
                  {item.sentimentAnalysis && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
                      Sentiment:{" "}
                      {(item.sentimentAnalysis.sentimentScore * 100).toFixed(0)}
                      %
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>

              {item.comment && (
                <p className="text-sm text-gray-700 mb-3">{item.comment}</p>
              )}

              {item.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Rating:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.rating}/5
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
