"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  Wifi,
} from "lucide-react";
import type { Alert, User as UserType } from "@/lib/types/api";
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
} from "recharts";
import { useToast } from "@/contexts/toast-context";
import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [assigningAlertId, setAssigningAlertId] = useState<string | null>(null);
  const toast = useToast();

  // Handle real-time alert updates
  const handleNewAlert = useCallback(
    (data: any) => {
      toast.warning("New Alert", `${data.severity}: ${data.title}`);
      loadAlerts();
    },
    [toast]
  );

  // WebSocket connection
  const { isConnected } = useRealtimeUpdates({
    onAlert: handleNewAlert,
    subscribeToAlerts: true,
  });

  useEffect(() => {
    loadAlerts();
    loadUsers();
  }, [statusFilter]);

  const loadUsers = async () => {
    try {
      const response = await apiClient.getUsers({}, 1, 100);
      setUsers(response.items || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load users:", error);
      }
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await apiClient.getAlerts(statusFilter);
      setAlerts(data);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load alerts:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiClient.resolveAlert(alertId, "Resolved by admin");
      toast.success("Alert Resolved", "The alert has been marked as resolved");
      await loadAlerts();
    } catch (error) {
      toast.error("Failed to resolve alert", "Please try again");
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to resolve alert:", error);
      }
    }
  };

  const handleAssignAlert = async (alertId: string, userId: string) => {
    try {
      await apiClient.assignAlert(alertId, userId);
      const user = users.find((u) => u.id === userId);
      toast.success(
        "Alert Assigned",
        `Assigned to ${user?.name || user?.email}`
      );
      setAssigningAlertId(null);
      await loadAlerts();
    } catch (error) {
      toast.error("Failed to assign alert", "Please try again");
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to assign alert:", error);
      }
    }
  };

  const handleUpdateStatus = async (alertId: string, status: string) => {
    try {
      await apiClient.updateAlertStatus(alertId, status);
      toast.success("Status Updated", `Alert status changed to ${status}`);
      await loadAlerts();
    } catch (error) {
      toast.error("Failed to update status", "Please try again");
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to update alert status:", error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "RESOLVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "DISMISSED":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "border-yellow-200";
      case "IN_PROGRESS":
        return "border-blue-200";
      case "RESOLVED":
        return "border-green-200";
      case "DISMISSED":
        return "border-gray-200";
      default:
        return "border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";
      case "HIGH":
        return "bg-orange-100 text-orange-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate stats
  const totalAlerts = alerts.length;
  const openAlerts = alerts.filter((a) => a.status === "OPEN").length;
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL").length;
  const resolvedAlerts = alerts.filter((a) => a.status === "RESOLVED").length;

  // Chart data
  const severityData = [
    {
      name: "Critical",
      value: alerts.filter((a) => a.severity === "CRITICAL").length,
      color: "#EF4444",
    },
    {
      name: "High",
      value: alerts.filter((a) => a.severity === "HIGH").length,
      color: "#F97316",
    },
    {
      name: "Medium",
      value: alerts.filter((a) => a.severity === "MEDIUM").length,
      color: "#EAB308",
    },
    {
      name: "Low",
      value: alerts.filter((a) => a.severity === "LOW").length,
      color: "#3B82F6",
    },
  ];

  const statusData = [
    {
      status: "Open",
      count: alerts.filter((a) => a.status === "OPEN").length,
    },
    {
      status: "In Progress",
      count: alerts.filter((a) => a.status === "IN_PROGRESS").length,
    },
    {
      status: "Resolved",
      count: alerts.filter((a) => a.status === "RESOLVED").length,
    },
    {
      status: "Dismissed",
      count: alerts.filter((a) => a.status === "DISMISSED").length,
    },
  ];

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and respond to customer alerts
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
              {isConnected ? "Live Updates" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {totalAlerts}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Alerts</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {openAlerts}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {criticalAlerts}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {resolvedAlerts}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Severity Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Alerts by Severity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Alerts by Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter || "ALL"}
            onChange={(e) =>
              setStatusFilter(
                e.target.value === "ALL" ? undefined : e.target.value
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-lg p-6 ${getStatusColor(
                alert.status
              )}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  {getStatusIcon(alert.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900">
                        {alert.type}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {alert.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Actions */}
              {alert.status !== "RESOLVED" && alert.status !== "DISMISSED" && (
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  {/* Status Update */}
                  {alert.status === "OPEN" && (
                    <button
                      onClick={() =>
                        handleUpdateStatus(alert.id, "IN_PROGRESS")
                      }
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      Start Working
                    </button>
                  )}

                  {/* Assignment */}
                  {assigningAlertId === alert.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) =>
                          handleAssignAlert(alert.id, e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select user...
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} ({user.role})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setAssigningAlertId(null)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningAlertId(alert.id)}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" />
                      {alert.assignedToId ? "Reassign" : "Assign"}
                    </button>
                  )}

                  {/* Resolve */}
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              )}

              {/* Show assigned user */}
              {alert.assignedToId && (
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                  <User className="w-3 h-3" />
                  <span>
                    Assigned to:{" "}
                    {users.find((u) => u.id === alert.assignedToId)?.name ||
                      "User"}
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
