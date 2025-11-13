"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Alert, AlertStatus, AlertSeverity, AlertType } from "@/lib/types/api";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  X,
} from "lucide-react";

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: "red",
    icon: AlertCircle,
    bg: "bg-red-500/10",
    border: "border-red-500/50",
    text: "text-red-400",
  },
  HIGH: {
    color: "orange",
    icon: AlertTriangle,
    bg: "bg-orange-500/10",
    border: "border-orange-500/50",
    text: "text-orange-400",
  },
  MEDIUM: {
    color: "yellow",
    icon: Info,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
  },
  LOW: {
    color: "blue",
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/50",
    text: "text-blue-400",
  },
};

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    bg: "bg-red-500/20",
    text: "text-red-300",
    icon: AlertCircle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    bg: "bg-yellow-500/20",
    text: "text-yellow-300",
    icon: Clock,
  },
  RESOLVED: {
    label: "Resolved",
    bg: "bg-green-500/20",
    text: "text-green-300",
    icon: CheckCircle,
  },
  DISMISSED: {
    label: "Dismissed",
    bg: "bg-gray-500/20",
    text: "text-gray-300",
    icon: X,
  },
};

interface AlertListProps {
  statusFilter?: AlertStatus;
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertList({
  statusFilter,
  onAlertClick,
}: AlertListProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<
    AlertSeverity | "ALL"
  >("ALL");
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus | "ALL">(
    statusFilter || "ALL"
  );

  useEffect(() => {
    loadAlerts();
  }, [statusFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAlerts(statusFilter);
      setAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== "ALL" && alert.severity !== selectedSeverity)
      return false;
    if (selectedStatus !== "ALL" && alert.status !== selectedStatus)
      return false;
    return true;
  });

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-300">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value as any)}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>

        {/* Count */}
        <div className="ml-auto text-sm text-gray-400">
          {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No alerts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const severityConfig = SEVERITY_CONFIG[alert.severity];
            const statusConfig = STATUS_CONFIG[alert.status];
            const SeverityIcon = severityConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={alert.id}
                onClick={() => onAlertClick?.(alert)}
                className={`${severityConfig.bg} ${severityConfig.border} border rounded-lg p-4 cursor-pointer hover:bg-opacity-20 transition-all`}
              >
                <div className="flex items-start gap-3">
                  {/* Severity Icon */}
                  <div className={`${severityConfig.text} mt-1`}>
                    <SeverityIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-white">
                        {alert.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                        {/* Severity Badge */}
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${severityConfig.bg} ${severityConfig.text} border ${severityConfig.border}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">
                      {alert.message}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(alert.createdAt)}
                      </span>
                      {alert.assignedToId && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Assigned
                        </span>
                      )}
                      <span className="text-gray-500">
                        #{alert.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
