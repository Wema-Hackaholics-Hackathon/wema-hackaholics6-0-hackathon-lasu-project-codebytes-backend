"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Upload, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface AudioRecorderProps {
  onSuccess?: (feedbackId: string) => void;
  customerSegment?: string;
  journeyStage?: string;
}

export default function AudioRecorder({
  onSuccess,
  customerSegment = "Regular",
  journeyStage = "Support",
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError("Failed to access microphone. Please grant permission.");
      if (process.env.NODE_ENV === "development") {
        console.error("Error accessing microphone:", err);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    setUploading(true);
    setError(null);

    try {
      // Convert blob to File object
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      const feedback = await apiClient.uploadAudio(audioFile, {
        customerSegment,
        journeyStage,
        recordingDuration: duration,
      });

      setSuccess(true);
      if (onSuccess) {
        onSuccess(feedback.id);
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        resetRecording();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload recording"
      );
    } finally {
      setUploading(false);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          Voice feedback uploaded successfully! Processing audio...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Recording Interface */}
      <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-center">
        {/* Timer Display */}
        {(isRecording || audioBlob) && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 rounded-full">
              {isRecording && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className="text-2xl font-mono text-white">
                {formatDuration(duration)}
              </span>
            </div>
          </div>
        )}

        {/* Audio Player */}
        {audioUrl && !isRecording && (
          <div className="mb-6">
            <audio
              controls
              src={audioUrl}
              className="w-full max-w-md mx-auto"
              style={{ filter: "invert(1) hue-rotate(180deg)" }}
            />
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex justify-center gap-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Mic className="w-6 h-6" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-3 px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-all transform hover:scale-105"
            >
              <Square className="w-6 h-6" />
              Stop Recording
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={uploadRecording}
                disabled={uploading}
                className="flex items-center gap-3 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {uploading ? "Uploading..." : "Upload Feedback"}
              </button>
              <button
                onClick={resetRecording}
                disabled={uploading}
                className="flex items-center gap-3 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold transition-all disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Discard
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        {!isRecording && !audioBlob && (
          <p className="mt-6 text-gray-400 text-sm">
            Click the microphone to start recording your feedback
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">Voice Feedback Tips:</p>
            <ul className="space-y-1 text-blue-300/80">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Find a quiet location for better quality</li>
              <li>• Keep your feedback concise (under 2 minutes)</li>
              <li>• Your recording will be analyzed for sentiment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
