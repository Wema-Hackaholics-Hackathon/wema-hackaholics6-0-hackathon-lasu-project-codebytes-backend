"use client";

import {
  Bell,
  Settings,
  Search,
  Filter,
  Download,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";
import { AuthButton } from "@/components/auth/auth-button";

interface DashboardHeaderProps {
  onSearch?: (query: string) => void;
  onFilter?: (filters: FilterOptions) => void;
  onRefresh?: () => void;
}

interface FilterOptions {
  timeRange: string;
  channel: string;
  sentiment?: string;
  rating?: string;
}

export function DashboardHeader({
  onSearch,
  onFilter,
  onRefresh,
}: DashboardHeaderProps = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    timeRange: "Last 24 Hours",
    channel: "All Channels",
    sentiment: "All",
    rating: "All",
  });

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [onRefresh]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<FilterOptions>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFilter?.(updatedFilters);
    },
    [filters, onFilter]
  );

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">W</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                <span className="sm:hidden">Wema CX</span>
                <span className="hidden sm:inline">
                  Customer Experience Dashboard
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Real-time feedback analytics
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search feedback, topics..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${
                  showFilters ? "bg-purple-100 text-purple-600" : ""
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>

              {showFilters && (
                <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Filter Options
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sentiment
                      </label>
                      <select
                        value={filters.sentiment}
                        onChange={(e) =>
                          handleFilterChange({ sentiment: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="All">All Sentiments</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <select
                        value={filters.rating}
                        onChange={(e) =>
                          handleFilterChange({ rating: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="All">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => {
                          const resetFilters = {
                            timeRange: "Last 24 Hours",
                            channel: "All Channels",
                            sentiment: "All",
                            rating: "All",
                          };
                          setFilters(resetFilters);
                          onFilter?.(resetFilters);
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRefresh}
              className={`p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>

            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>

            <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            <div className="pl-4 border-l border-gray-200">
              <AuthButton />
            </div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors touch-target"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-3 py-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search feedback, topics..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors">
                  <Filter className="w-5 h-5" />
                </button>

                <button
                  onClick={handleRefresh}
                  className={`p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors">
                  <Download className="w-5 h-5" />
                </button>

                <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile */}
              <AuthButton />
            </div>

            {/* Time Range Selectors */}
            <div className="grid grid-cols-2 gap-3">
              <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Custom Range</option>
              </select>

              <select className="border border-gray-300 rounded-md px-3 py-2 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm">
                <option>All Channels</option>
                <option>Mobile App</option>
                <option>Call Center</option>
                <option>Chatbot</option>
                <option>Branch</option>
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600">
                  System Status: Operational
                </span>
              </div>
              <div className="text-gray-600">
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Status Bar */}
      <div className="hidden lg:block border-t border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">System Status: Operational</span>
            </div>
            <div className="text-gray-600">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <select
              value={filters.timeRange}
              onChange={(e) =>
                handleFilterChange({ timeRange: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-1 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>

            <select
              value={filters.channel}
              onChange={(e) => handleFilterChange({ channel: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-1 text-gray-900 font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option>All Channels</option>
              <option>Mobile App</option>
              <option>Call Center</option>
              <option>Chatbot</option>
              <option>Branch</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
