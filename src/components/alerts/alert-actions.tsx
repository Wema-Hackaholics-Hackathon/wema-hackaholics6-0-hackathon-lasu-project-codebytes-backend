"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Alert } from "@/lib/types/api";
import { X, User, CheckCircle, Play } from "lucide-react";

interface AlertActionsProps {
  alert: Alert;
  onUpdate?: (updatedAlert: Alert) => void;
  onClose?: () => void;
}

export default function AlertActions({
  alert,
  onUpdate,
  onClose,
}: AlertActionsProps) {
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (newStatus: string) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await apiClient.updateAlertStatus(alert.id, newStatus);
      if (onUpdate) {
        onUpdate(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      setError("Please provide a resolution note");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await apiClient.resolveAlert(alert.id, resolution);
      if (onUpdate) {
        onUpdate(updated);
      }
      setResolution("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve alert");
    } finally {
      setLoading(false);
    }
  };

  const canResolve =
    alert.status !== "RESOLVED" && alert.status !== "DISMISSED";
  const canChangeStatus = alert.status !== "RESOLVED";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {alert.title}
            </h2>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                {alert.type}
              </span>
              <span
                className={`px-2 py-1 rounded ${
                  alert.severity === "CRITICAL"
                    ? "bg-red-500/20 text-red-300"
                    : alert.severity === "HIGH"
                    ? "bg-orange-500/20 text-orange-300"
                    : alert.severity === "MEDIUM"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {alert.severity}
              </span>
              <span
                className={`px-2 py-1 rounded ${
                  alert.status === "OPEN"
                    ? "bg-red-500/20 text-red-300"
                    : alert.status === "IN_PROGRESS"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : alert.status === "RESOLVED"
                    ? "bg-green-500/20 text-green-300"
                    : "bg-gray-500/20 text-gray-300"
                }`}
              >
                {alert.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Message */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">
              Message
            </h3>
            <p className="text-white">{alert.message}</p>
          </div>

          {/* Data Snapshot */}
          {alert.dataSnapshot && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Data</h3>
              <div className="bg-gray-800/50 rounded-lg p-3 font-mono text-xs text-gray-300 overflow-x-auto">
                <pre>{JSON.stringify(alert.dataSnapshot, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-1">
                Created
              </h3>
              <p className="text-white text-sm">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
            {alert.resolvedAt && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">
                  Resolved
                </h3>
                <p className="text-white text-sm">
                  {new Date(alert.resolvedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Existing Resolution */}
          {alert.resolution && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">
                Resolution Note
              </h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-200 text-sm">
                {alert.resolution}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {canChangeStatus && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Update Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {alert.status !== "OPEN" && (
                  <button
                    onClick={() => handleUpdateStatus("OPEN")}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Reopen
                  </button>
                )}
                {alert.status !== "IN_PROGRESS" && canChangeStatus && (
                  <button
                    onClick={() => handleUpdateStatus("IN_PROGRESS")}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    <Play className="w-4 h-4 inline mr-2" />
                    Start Working
                  </button>
                )}
                {alert.status !== "DISMISSED" && canChangeStatus && (
                  <button
                    onClick={() => handleUpdateStatus("DISMISSED")}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors disabled:opacity-50 text-sm"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Resolve Alert */}
          {canResolve && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">
                Resolve Alert
              </h3>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Enter resolution notes..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm mb-3"
              />
              <button
                onClick={handleResolve}
                disabled={loading || !resolution.trim()}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                {loading ? "Resolving..." : "Mark as Resolved"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
