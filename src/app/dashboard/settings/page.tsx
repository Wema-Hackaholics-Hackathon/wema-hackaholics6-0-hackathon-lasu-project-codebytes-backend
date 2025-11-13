"use client";

import { Settings as SettingsIcon, Bell, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your preferences and configuration
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Notifications
            </h2>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Email notifications for new feedback
              </span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">Alert notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Weekly summary reports
              </span>
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <div className="space-y-3">
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Change password
            </button>
            <div className="pt-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Enable two-factor authentication
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* General */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>UTC</option>
                <option>WAT (West Africa Time)</option>
                <option>GMT</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
