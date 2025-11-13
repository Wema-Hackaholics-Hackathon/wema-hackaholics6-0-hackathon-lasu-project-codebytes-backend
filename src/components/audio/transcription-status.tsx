"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface TranscriptionStatusProps {
  feedbackId: string;
  onComplete?: (transcription: string) => void;
}

export default function TranscriptionStatus({
  feedbackId,
  onComplete,
}: TranscriptionStatusProps) {
  const [status, setStatus] = useState<
    "pending" | "processing" | "completed" | "failed"
  >("pending");
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const feedback = await apiClient.getFeedbackById(feedbackId);

        const transcriptionStatus =
          feedback.metadata?.transcriptionStatus || "pending";
        const transcriptionText = feedback.metadata?.transcription || "";
        const transcriptionError = feedback.metadata?.transcriptionError;

        setStatus(transcriptionStatus);

        if (transcriptionStatus === "completed" && transcriptionText) {
          setTranscription(transcriptionText);
          setProgress(100);
          if (onComplete) {
            onComplete(transcriptionText);
          }
          clearInterval(interval);
        } else if (transcriptionStatus === "failed") {
          setError(
            transcriptionError || "Transcription failed. Please try again."
          );
          clearInterval(interval);
        } else if (transcriptionStatus === "processing") {
          // Simulate progress for processing state
          setProgress((prev) => Math.min(prev + 10, 90));
        }
      } catch (err) {
        console.error("Failed to check transcription status:", err);
      }
    };

    // Poll every 3 seconds
    checkStatus();
    interval = setInterval(checkStatus, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [feedbackId, onComplete]);

  const getStatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "pending":
        return "Queued for transcription";
      case "processing":
        return "Transcribing audio...";
      case "completed":
        return "Transcription complete";
      case "failed":
        return "Transcription failed";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Status Header */}
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
          {status === "processing" && (
            <p className="text-xs text-gray-500">
              This may take a few moments...
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(status === "pending" || status === "processing") && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Transcription Result */}
      {status === "completed" && transcription && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-800 mb-1">
            Transcription:
          </p>
          <p className="text-sm text-gray-900">{transcription}</p>
        </div>
      )}

      {/* Error Message */}
      {status === "failed" && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
