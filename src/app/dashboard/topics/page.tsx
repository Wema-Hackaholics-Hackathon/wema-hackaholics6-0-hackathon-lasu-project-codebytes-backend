"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Tag,
  Plus,
  TrendingUp,
  MessageSquare,
  BarChart3,
  PieChart,
  GitMerge,
  Eye,
} from "lucide-react";
import type { Topic } from "@/lib/types/api";
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
} from "recharts";
import { TopicDetailsModal } from "@/components/topics/topic-details-modal";
import { useToast } from "@/contexts/toast-context";

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

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMergeForm, setShowMergeForm] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [mergeTargetId, setMergeTargetId] = useState<string>("");
  const [newTopic, setNewTopic] = useState({
    name: "",
    description: "",
    category: "",
  });
  const toast = useToast();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await apiClient.getTopics();
      setTopics(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load topics:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async () => {
    if (!newTopic.name.trim()) {
      toast.error("Validation Error", "Topic name is required");
      return;
    }

    try {
      await apiClient.createTopic(newTopic);
      toast.success("Topic Created", `"${newTopic.name}" has been created`);
      setNewTopic({ name: "", description: "", category: "" });
      setShowAddForm(false);
      await loadTopics();
    } catch (error) {
      toast.error("Failed to create topic", "Please try again");
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to create topic:", error);
      }
    }
  };

  const handleMergeTopics = async () => {
    if (selectedForMerge.length === 0 || !mergeTargetId) {
      toast.error(
        "Validation Error",
        "Please select topics to merge and a target"
      );
      return;
    }

    if (selectedForMerge.includes(mergeTargetId)) {
      toast.error(
        "Invalid Selection",
        "Target topic cannot be in the merge list"
      );
      return;
    }

    try {
      await apiClient.mergeTopics(selectedForMerge, mergeTargetId);
      toast.success(
        "Topics Merged",
        `${selectedForMerge.length} topics merged successfully`
      );
      setSelectedForMerge([]);
      setMergeTargetId("");
      setShowMergeForm(false);
      await loadTopics();
    } catch (error) {
      toast.error("Failed to merge topics", "Please try again");
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to merge topics:", error);
      }
    }
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedForMerge((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  // Prepare chart data
  const topTopics = topics
    .sort((a, b) => {
      const countA = (a as any)._count?.feedback || a.count || 0;
      const countB = (b as any)._count?.feedback || b.count || 0;
      return countB - countA;
    })
    .slice(0, 10)
    .map((topic) => ({
      name:
        topic.name.length > 15
          ? topic.name.substring(0, 15) + "..."
          : topic.name,
      fullName: topic.name,
      mentions: (topic as any)._count?.feedback || topic.count || 0,
    }));

  const topicsPieData = topics.slice(0, 6).map((topic) => ({
    name: topic.name,
    value: (topic as any)._count?.feedback || topic.count || 0,
  }));

  const totalMentions = topics.reduce(
    (sum, topic) => sum + ((topic as any)._count?.feedback || topic.count || 0),
    0
  );
  const avgMentions =
    topics.length > 0 ? Math.round(totalMentions / topics.length) : 0;

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Topics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage feedback topics and categories
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMergeForm(!showMergeForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <GitMerge className="w-4 h-4" />
            Merge Topics
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Topic
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Topics</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {topics.length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Mentions
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalMentions.toLocaleString()}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Mentions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {avgMentions}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {topics.filter((t) => t.count > avgMentions).length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {topics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart - Top Topics */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Topics by Mentions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topTopics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    value,
                    props.payload.fullName,
                  ]}
                />
                <Bar dataKey="mentions" fill="#7C3AED" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Topic Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Topic Distribution (Top 6)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={topicsPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    const radius =
                      innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x =
                      cx + radius * Math.cos((-midAngle * Math.PI) / 180);
                    const y =
                      cy + radius * Math.sin((-midAngle * Math.PI) / 180);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? "start" : "end"}
                        dominantBaseline="central"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topicsPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) =>
                    value.length > 20 ? value.substring(0, 20) + "..." : value
                  }
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Topic Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            New Topic
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newTopic.name}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Customer Service"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newTopic.description}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={newTopic.category}
                onChange={(e) =>
                  setNewTopic({ ...newTopic, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., technical, general, billing"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddTopic}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Create Topic
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTopic({ name: "", description: "", category: "" });
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Topics Form */}
      {showMergeForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Merge Topics
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select topics to merge and choose a target topic. All feedback from
            selected topics will be moved to the target topic.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select topics to merge ({selectedForMerge.length} selected)
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedForMerge.includes(topic.id)}
                      onChange={() => toggleTopicSelection(topic.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">{topic.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {(topic as any)._count?.feedback || topic.count || 0}{" "}
                      mentions
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target topic *
              </label>
              <select
                value={mergeTargetId}
                onChange={(e) => setMergeTargetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select target topic...</option>
                {topics
                  .filter((t) => !selectedForMerge.includes(t.id))
                  .map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name} (
                      {(topic as any)._count?.feedback || topic.count || 0}{" "}
                      mentions)
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMergeTopics}
                disabled={selectedForMerge.length === 0 || !mergeTargetId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
              >
                Merge Topics
              </button>
              <button
                onClick={() => {
                  setShowMergeForm(false);
                  setSelectedForMerge([]);
                  setMergeTargetId("");
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Topics</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {topics.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No topics found</p>
              <p className="text-xs text-gray-500 mt-1">
                Create your first topic to get started
              </p>
            </div>
          ) : (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {topic.name}
                      </h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {topic.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          Created{" "}
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                          {(
                            (topic as any)._count?.feedback ||
                            topic.count ||
                            0
                          ).toLocaleString()}{" "}
                          mentions
                        </span>
                        {topic.category && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                            {topic.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTopic(topic)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {(topic as any)._count?.feedback || topic.count || 0}
                      </div>
                      <div className="text-xs text-gray-500">mentions</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Topic Details Modal */}
      {selectedTopic && (
        <TopicDetailsModal
          topic={selectedTopic}
          onClose={() => setSelectedTopic(null)}
          onUpdate={loadTopics}
          onDelete={loadTopics}
        />
      )}
    </div>
  );
}
