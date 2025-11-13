"use client";

import FeedbackForm from "@/components/feedback/feedback-form";
import Link from "next/link";

export default function CustomerFeedbackPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Share Your Feedback
          </h1>
          <p className="text-purple-200 text-lg">
            Help us improve your banking experience with Wema Bank
          </p>
        </div>

        {/* Feedback Form */}
        <FeedbackForm
          onSuccess={() => {
            // Optional: Show additional success message or redirect
            console.log("Feedback submitted successfully!");
          }}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/customer"
            className="text-purple-300 hover:text-purple-100 transition-colors text-sm"
          >
            ← Back to Customer Portal
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Why Your Feedback Matters
          </h2>
          <ul className="space-y-2 text-purple-200">
            <li className="flex items-start">
              <span className="mr-2">✨</span>
              <span>Your input helps us understand your needs better</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🚀</span>
              <span>We use AI to analyze feedback in real-time</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">💡</span>
              <span>Critical issues are flagged immediately to our team</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎯</span>
              <span>Your feedback drives continuous improvement</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
