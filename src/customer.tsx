"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import NextImage from "next/image";
import {
  CheckCircle,
  QrCode,
  Star,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

const API_URL = "http://localhost:4000/api/v1/feedback";

interface FeedbackData {
  rating: number;
  comment: string;
  channel: "In-Branch" | "Digital" | "ATM";
}

type PortalView = "QR_CODE" | "FORM" | "THANK_YOU";

// Rating Selector Component
interface RatingSelectorProps {
  rating: number;
  setRating: (r: number) => void;
  disabled: boolean;
}

const RatingSelector: React.FC<RatingSelectorProps> = ({
  rating,
  setRating,
  disabled,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const ratings = [
    { value: 1, label: "Very Poor" },
    { value: 2, label: "Poor" },
    { value: 3, label: "Average" },
    { value: 4, label: "Good" },
    { value: 5, label: "Excellent" },
  ];

  const currentRating = hoveredRating || rating;

  return (
    <div>
      {/* Star Rating Display */}
      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && setRating(star)}
            onMouseEnter={() => !disabled && setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={disabled}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              className={`w-10 h-10 transition-colors ${
                star <= currentRating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Rating Label */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {ratings.find((r) => r.value === currentRating)?.label ||
            "Select Rating"}
        </p>
      </div>
    </div>
  );
};

// QR Code Display Component
interface QRCodeDisplayProps {
  url: string;
  onBack: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, onBack }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <QrCode className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Scan QR Code
          </h2>
          <p className="text-sm text-gray-600">
            Access feedback form on your mobile device
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <QRCodeSVG
              value={url}
              size={200}
              level="H"
              fgColor="#1f2937"
              bgColor="#ffffff"
            />
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
        >
          Back to Form
        </button>
      </div>
    </div>
  );
};

// Feedback Form Component
interface FeedbackFormProps {
  onSubmissionSuccess: () => void;
  onGoToQR: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmissionSuccess,
  onGoToQR,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [channel, setChannel] = useState<"In-Branch" | "Digital" | "ATM">(
    "In-Branch"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel:
              channel === "In-Branch"
                ? "WEB_FORM"
                : channel === "Digital"
                ? "IN_APP_SURVEY"
                : "WEB_FORM",
            rating,
            comment: comment || undefined,
            source: "Customer Portal",
            metadata: { channel: channel },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to submit feedback: ${response.status}`);
        }

        await response.json();
        onSubmissionSuccess();
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Connection error:", err);
        }
        setError("An error occurred during submission. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [rating, comment, channel, onSubmissionSuccess]
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <MessageSquare className="w-10 h-10 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Share Your Feedback
          </h1>
          <p className="text-sm text-gray-600">Your experience matters to us</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
              How was your experience?
            </label>
            <RatingSelector
              rating={rating}
              setRating={setRating}
              disabled={loading}
            />
          </div>

          {/* Comment Section */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tell us more{" "}
              <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value.substring(0, 500))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Share your thoughts..."
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {comment.length}/500
              </div>
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Which service?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "In-Branch", label: "Branch" },
                { value: "Digital", label: "Mobile App" },
                { value: "ATM", label: "ATM" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setChannel(option.value as any)}
                  disabled={loading}
                  className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                    channel === option.value
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Submit Feedback"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onGoToQR}
              className="flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Show QR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Thank You Component
const ThankYou: React.FC<{ onStartNew: () => void }> = ({ onStartNew }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
        {/* Success Icon */}
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />

        {/* Thank You Message */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Thank You!
        </h1>

        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
          Your feedback has been successfully submitted. We appreciate your time
          and will use your insights to improve our services.
        </p>

        {/* Action Button */}
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Submit Another
        </button>
      </div>
    </div>
  );
};

// Main Portal Component
const FeedbackPortal: React.FC = () => {
  const [view, setView] = useState<PortalView>("FORM");

  const qrCodeUrl = useMemo(() => {
    return "http://localhost:3000/customer";
  }, []);

  const renderContent = () => {
    switch (view) {
      case "QR_CODE":
        return <QRCodeDisplay url={qrCodeUrl} onBack={() => setView("FORM")} />;
      case "FORM":
        return (
          <FeedbackForm
            onSubmissionSuccess={() => setView("THANK_YOU")}
            onGoToQR={() => setView("QR_CODE")}
          />
        );
      case "THANK_YOU":
        return <ThankYou onStartNew={() => setView("FORM")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NextImage
                src="/logo.png"
                alt="Wema Bank"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Customer Feedback
                </h1>
                <p className="text-xs text-gray-600">Wema Bank</p>
              </div>
            </div>

            <Link
              href="/login"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">{renderContent()}</main>

      {/* Footer */}
      <footer className="text-center py-6">
        <p className="text-xs text-gray-500">
          © 2024 Wema Bank. Your feedback drives our excellence.
        </p>
      </footer>
    </div>
  );
};

export default FeedbackPortal;
