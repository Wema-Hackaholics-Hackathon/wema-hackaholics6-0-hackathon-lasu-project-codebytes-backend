"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { FeedbackChannel } from "@/lib/types/api";

interface FeedbackFormProps {
  onSuccess?: () => void;
  defaultChannel?: FeedbackChannel;
}

const CHANNELS: { value: FeedbackChannel; label: string; icon: string }[] = [
  { value: "IN_APP_SURVEY", label: "In-App Survey", icon: "📱" },
  { value: "CHATBOT", label: "Chatbot", icon: "💬" },
  { value: "VOICE_CALL", label: "Voice Call", icon: "📞" },
  { value: "SOCIAL_MEDIA", label: "Social Media", icon: "🐦" },
  { value: "EMAIL", label: "Email", icon: "✉️" },
  { value: "WEB_FORM", label: "Web Form", icon: "🌐" },
  { value: "SMS", label: "SMS", icon: "💬" },
];

const CUSTOMER_SEGMENTS = [
  { value: "VIP", label: "VIP Customer" },
  { value: "Regular", label: "Regular Customer" },
  { value: "New", label: "New Customer" },
];

const JOURNEY_STAGES = [
  { value: "Onboarding", label: "Onboarding" },
  { value: "Transaction", label: "Transaction" },
  { value: "Support", label: "Support" },
  { value: "Retention", label: "Retention" },
  { value: "Advocacy", label: "Advocacy" },
];

export default function FeedbackForm({
  onSuccess,
  defaultChannel,
}: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    channel: defaultChannel || ("IN_APP_SURVEY" as FeedbackChannel),
    rating: 0,
    comment: "",
    customerSegment: "Regular",
    journeyStage: "Transaction",
    source: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiClient.createFeedback({
        channel: formData.channel,
        rating: formData.rating || undefined,
        comment: formData.comment || undefined,
        customerSegment: formData.customerSegment,
        journeyStage: formData.journeyStage,
        source: formData.source || undefined,
      });

      setSuccess(true);
      setFormData({
        channel: defaultChannel || "IN_APP_SURVEY",
        rating: 0,
        comment: "",
        customerSegment: "Regular",
        journeyStage: "Transaction",
        source: "",
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10"
    >
      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          Feedback submitted successfully! Thank you for your input.
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Channel Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Feedback Channel *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHANNELS.map((channel) => (
            <button
              key={channel.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, channel: channel.value })
              }
              className={`p-3 rounded-lg border transition-all ${
                formData.channel === channel.value
                  ? "border-purple-500 bg-purple-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/50"
              }`}
            >
              <div className="text-2xl mb-1">{channel.icon}</div>
              <div className="text-xs">{channel.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Rating (1-5 stars)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, rating: star })}
              className="text-3xl transition-transform hover:scale-110"
            >
              {star <= formData.rating ? "⭐" : "☆"}
            </button>
          ))}
          <span className="ml-2 text-gray-300 self-center">
            {formData.rating > 0
              ? `${formData.rating} star${formData.rating > 1 ? "s" : ""}`
              : "Not rated"}
          </span>
        </div>
      </div>

      {/* Comment */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Your Feedback
        </label>
        <textarea
          id="comment"
          rows={4}
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Share your experience with us..."
        />
      </div>

      {/* Customer Segment */}
      <div>
        <label
          htmlFor="customerSegment"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Customer Type
        </label>
        <select
          id="customerSegment"
          value={formData.customerSegment}
          onChange={(e) =>
            setFormData({ ...formData, customerSegment: e.target.value })
          }
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {CUSTOMER_SEGMENTS.map((segment) => (
            <option
              key={segment.value}
              value={segment.value}
              className="bg-white"
            >
              {segment.label}
            </option>
          ))}
        </select>
      </div>

      {/* Journey Stage */}
      <div>
        <label
          htmlFor="journeyStage"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Journey Stage
        </label>
        <select
          id="journeyStage"
          value={formData.journeyStage}
          onChange={(e) =>
            setFormData({ ...formData, journeyStage: e.target.value })
          }
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {JOURNEY_STAGES.map((stage) => (
            <option key={stage.value} value={stage.value} className="bg-white">
              {stage.label}
            </option>
          ))}
        </select>
      </div>

      {/* Source (optional) */}
      <div>
        <label
          htmlFor="source"
          className="block text-sm font-medium text-gray-200 mb-2"
        >
          Source (optional)
        </label>
        <input
          id="source"
          type="text"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., Mobile App v2.1, Twitter @wemabank"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        {loading ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
