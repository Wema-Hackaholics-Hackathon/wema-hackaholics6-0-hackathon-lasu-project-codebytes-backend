"use client";

import { useState } from "react";
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  MapPin,
  Smartphone,
  Monitor,
  Bug,
} from "lucide-react";

interface CrashReport {
  id: string;
  error: string;
  stack: string;
  page: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  severity: "low" | "medium" | "high" | "critical";
  count: number;
}

interface DropOffPoint {
  page: string;
  exitRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
  users: number;
  trend: "up" | "down" | "stable";
}

export default function CrashAnalytics() {
  const [timeRange, setTimeRange] = useState("24h");

  // Mock crash data
  const crashReports: CrashReport[] = [
    {
      id: "1",
      error: "ChunkLoadError: Loading chunk failed",
      stack: "at __webpack_require__.f.j (webpack-runtime.js:1:1)",
      page: "/dashboard/transactions",
      userAgent: "Chrome/120.0.0.0",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      severity: "high",
      count: 23,
    },
    {
      id: "2",
      error: "TypeError: Cannot read property of undefined",
      stack: "at CustomerCard.render (customer-card.tsx:45:12)",
      page: "/dashboard/customers",
      userAgent: "Safari/17.0",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      severity: "critical",
      count: 15,
    },
    {
      id: "3",
      error: "Network Error: Failed to fetch",
      stack: "at fetch (api-client.ts:23:5)",
      page: "/dashboard/analytics",
      userAgent: "Firefox/121.0",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      severity: "medium",
      count: 8,
    },
  ];

  const dropOffPoints: DropOffPoint[] = [
    {
      page: "/onboarding/verification",
      exitRate: 67.3,
      avgTimeOnPage: 45,
      bounceRate: 23.1,
      users: 1247,
      trend: "up",
    },
    {
      page: "/dashboard/loan-application",
      exitRate: 54.2,
      avgTimeOnPage: 120,
      bounceRate: 18.7,
      users: 892,
      trend: "down",
    },
    {
      page: "/transfer/international",
      exitRate: 43.8,
      avgTimeOnPage: 89,
      bounceRate: 31.2,
      users: 634,
      trend: "up",
    },
    {
      page: "/dashboard/investments",
      exitRate: 38.9,
      avgTimeOnPage: 156,
      bounceRate: 15.4,
      users: 445,
      trend: "stable",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-green-500 rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crash Analytics</h2>
          <p className="text-gray-600">
            Monitor application errors and user drop-off points
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crashes</p>
              <p className="text-2xl font-bold text-gray-900">46</p>
              <p className="text-sm text-red-600">+12% from yesterday</p>
            </div>
            <Bug className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Affected Users
              </p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-sm text-orange-600">+8% from yesterday</p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Drop-off Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">51.1%</p>
              <p className="text-sm text-green-600">-3% from yesterday</p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Critical Issues
              </p>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-red-600">Needs attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Crash Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Crash Reports
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crashReports.map((crash) => (
                <tr key={crash.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {crash.error}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {crash.stack}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {crash.page}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                        crash.severity
                      )}`}
                    >
                      {crash.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {crash.count}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {crash.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    {crash.userAgent.includes("Chrome") ? (
                      <Monitor className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drop-off Points */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            High Drop-off Points
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dropOffPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{point.page}</p>
                      <p className="text-sm text-gray-500">
                        {point.users} users affected
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {point.exitRate}%
                    </p>
                    <p className="text-xs text-gray-500">Exit Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {point.avgTimeOnPage}s
                    </p>
                    <p className="text-xs text-gray-500">Avg Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      {point.bounceRate}%
                    </p>
                    <p className="text-xs text-gray-500">Bounce Rate</p>
                  </div>
                  {getTrendIcon(point.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
