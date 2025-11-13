"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface TrendData {
  hour?: number;
  day?: string;
  sentiment: number;
  volume: number;
}

interface SentimentTrendsProps {
  hourlyData?: TrendData[];
  weeklyData?: TrendData[];
  viewType?: "hourly" | "weekly";
}

export function SentimentTrends({
  hourlyData = [],
  weeklyData = [],
  viewType = "hourly",
}: SentimentTrendsProps) {
  const data = viewType === "hourly" ? hourlyData : weeklyData;
  const xAxisKey = viewType === "hourly" ? "hour" : "day";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">
            {viewType === "hourly" ? `${label}:00` : label}
          </p>
          <p className="text-sm text-purple-600">
            Sentiment: {data.sentiment.toFixed(1)}/10
          </p>
          <p className="text-sm text-gray-600">
            Volume: {Math.round(data.volume)}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (value: any) => {
    if (viewType === "hourly") {
      return `${value}:00`;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Sentiment Trends
        </CardTitle>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewType === "hourly"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            24H
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewType === "weekly"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            7D
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={300}
            minHeight={320}
          >
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="sentimentGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxisLabel}
              />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#8B5CF6"
                strokeWidth={2}
                fill="url(#sentimentGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {Math.max(...data.map((d) => d.sentiment)).toFixed(1)}
            </div>
            <div className="text-sm text-green-700">Peak Score</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {(
                data.reduce((sum, d) => sum + d.sentiment, 0) / data.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-blue-700">Average</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {Math.round(data.reduce((sum, d) => sum + d.volume, 0))}
            </div>
            <div className="text-sm text-purple-700">Total Volume</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
