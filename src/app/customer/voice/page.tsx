"use client";

import AudioRecorder from "@/components/audio/audio-recorder";
import TranscriptionStatus from "@/components/audio/transcription-status";
import Link from "next/link";
import { useState } from "react";

export default function VoiceFeedbackPage() {
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎙️</div>
          <h1 className="text-4xl font-bold text-white mb-2">Voice Feedback</h1>
          <p className="text-purple-200 text-lg">
            Share your experience using your voice
          </p>
        </div>

        {/* Audio Recorder */}
        <AudioRecorder
          onSuccess={(feedbackId) => {
            setSubmittedId(feedbackId);
          }}
          customerSegment="Regular"
          journeyStage="Support"
        />

        {/* Success Details with Transcription Status */}
        {submittedId && (
          <div className="mt-6 space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-200 mb-2">
                Recording Submitted!
              </h3>
              <p className="text-green-300/80 text-sm mb-3">
                Your voice feedback has been received and is being processed.
              </p>
              <div className="bg-gray-800/50 rounded p-3 font-mono text-xs text-gray-300">
                Feedback ID: {submittedId}
              </div>
            </div>

            {/* Transcription Status */}
            <TranscriptionStatus
              feedbackId={submittedId}
              onComplete={(transcription) => {
                console.log("Transcription completed:", transcription);
              }}
            />
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/customer/feedback"
            className="text-purple-300 hover:text-purple-100 transition-colors text-sm underline"
          >
            ← Text Feedback
          </Link>
          <Link
            href="/customer"
            className="text-purple-300 hover:text-purple-100 transition-colors text-sm underline"
          >
            Customer Portal
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            How It Works
          </h2>
          <div className="space-y-4 text-purple-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <h3 className="font-semibold text-white">
                  Record Your Feedback
                </h3>
                <p className="text-sm text-purple-300/80">
                  Click the microphone button and speak naturally
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <h3 className="font-semibold text-white">Review & Upload</h3>
                <p className="text-sm text-purple-300/80">
                  Listen to your recording and upload when ready
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <h3 className="font-semibold text-white">AI Analysis</h3>
                <p className="text-sm text-purple-300/80">
                  Our system analyzes sentiment and key topics automatically
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">4️⃣</div>
              <div>
                <h3 className="font-semibold text-white">Action & Response</h3>
                <p className="text-sm text-purple-300/80">
                  Critical issues are flagged to our team immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
