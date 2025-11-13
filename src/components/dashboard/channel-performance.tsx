"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumber } from "@/lib/utils";
import { Smartphone, Phone, MessageCircle, Building } from "lucide-react";

interface ChannelData {
  channel: string;
  score: number;
  volume: number;
}

interface ChannelPerformanceProps {
  channels: ChannelData[];
}

const getChannelIcon = (channel: string) => {
  const icons = {
    "Mobile App": <Smartphone className="w-5 h-5" />,
    "Call Center": <Phone className="w-5 h-5" />,
    Chatbot: <MessageCircle className="w-5 h-5" />,
    Branch: <Building className="w-5 h-5" />,
  };
  return (
    icons[channel as keyof typeof icons] || (
      <MessageCircle className="w-5 h-5" />
    )
  );
};

export function ChannelPerformance({ channels }: ChannelPerformanceProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-purple-600">
            Score: {payload[0].value.toFixed(1)}/10
          </p>
          <p className="text-sm text-gray-600">
            Volume: {formatNumber(payload[0].payload.volume)}
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
          Channel Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 mb-6 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={300}
            minHeight={320}
          >
            <BarChart
              data={channels}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="channel"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-purple-600">
                  {getChannelIcon(channel.channel)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {channel.channel}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatNumber(channel.volume)} interactions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {channel.score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Score</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
