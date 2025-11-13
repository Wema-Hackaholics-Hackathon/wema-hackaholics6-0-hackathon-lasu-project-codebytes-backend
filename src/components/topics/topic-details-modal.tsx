"use client";

import { useState, useEffect } from "react";
import { X, Tag, MessageSquare, Calendar, Edit, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { Topic, Feedback } from "@/lib/types/api";

interface TopicDetailsModalProps {
  topic: Topic;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function TopicDetailsModal({
  topic,
  onClose,
  onUpdate,
  onDelete,
}: TopicDetailsModalProps) {
  const [relatedFeedback, setRelatedFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: topic.name,
    description: topic.description || "",
    category: topic.category || "",
  });

  useEffect(() => {
    loadRelatedFeedback();
  }, [topic.id]);

  const loadRelatedFeedback = async () => {
    try {
      // Note: Backend doesn't have this endpoint yet, this is a placeholder
      // const data = await apiClient.getFeedbackByTopic(topic.id);
      // setRelatedFeedback(data);
      setRelatedFeedback([]);
    } catch (error) {
      console.error("Failed to load related feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.updateTopic(topic.id, editData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update topic:", error);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${topic.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteTopic(topic.id);
      onDelete();
      onClose();
    } catch (error) {
      console.error("Failed to delete topic:", error);
    }
  };

  const topicCount = (topic as any)._count?.feedback || topic.count || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="text-2xl font-bold text-gray-900 border-b-2 border-purple-500 focus:outline-none w-full"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {topic.name}
                </h2>
              )}
              <p className="text-sm text-gray-600 mt-1">
                {topicCount.toLocaleString()} mentions
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    title="Edit topic"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete topic"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            {isEditing ? (
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                rows={3}
                placeholder="Add a description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-sm text-gray-700">
                {topic.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="mt-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            {isEditing ? (
              <input
                type="text"
                value={editData.category}
                onChange={(e) =>
                  setEditData({ ...editData, category: e.target.value })
                }
                placeholder="Category (e.g., technical, general)"
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <span className="text-sm text-gray-600">
                Category: {topic.category || "Uncategorized"}
              </span>
            )}
          </div>

          {/* Edit actions */}
          {isEditing && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    name: topic.name,
                    description: topic.description || "",
                    category: topic.category || "",
                  });
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">
                  Created
                </span>
              </div>
              <p className="text-sm text-gray-900">
                {new Date(topic.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">
                  Last Updated
                </span>
              </div>
              <p className="text-sm text-gray-900">
                {new Date(topic.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Related Feedback */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Related Feedback
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : relatedFeedback.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  No related feedback found
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This endpoint is not yet implemented in the backend
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {relatedFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
                        {feedback.channel.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="text-sm text-gray-700">
                        {feedback.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
