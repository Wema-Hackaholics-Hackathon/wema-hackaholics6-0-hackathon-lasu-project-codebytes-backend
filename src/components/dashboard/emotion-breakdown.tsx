"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { formatNumber, getEmotionColor } from "@/lib/utils";

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
}

interface EmotionBreakdownProps {
  emotions: EmotionData[];
}

const EMOTION_COLORS = {
  Joy: "#10B981",
  Satisfaction: "#3B82F6",
  Neutral: "#6B7280",
  Frustration: "#F59E0B",
  Anger: "#EF4444",
  Sadness: "#8B5CF6",
};

export function EmotionBreakdown({ emotions }: EmotionBreakdownProps) {
  const chartData = emotions.map((emotion) => ({
    ...emotion,
    fill:
      EMOTION_COLORS[emotion.emotion as keyof typeof EMOTION_COLORS] ||
      "#6B7280",
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.emotion}</p>
          <p className="text-sm text-gray-600">
            {formatNumber(data.count)} responses ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Emotion Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={300}
            minHeight={320}
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {emotions.map((emotion, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    EMOTION_COLORS[
                      emotion.emotion as keyof typeof EMOTION_COLORS
                    ],
                }}
              />
              <span className="text-sm text-gray-700">{emotion.emotion}</span>
              <span className="text-sm font-medium text-gray-900">
                {emotion.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
