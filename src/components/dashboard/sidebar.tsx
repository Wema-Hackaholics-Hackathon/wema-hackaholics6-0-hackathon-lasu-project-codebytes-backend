"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Tag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Feedback", href: "/dashboard/feedback", icon: MessageSquare },
  { name: "Alerts", href: "/dashboard/alerts", icon: AlertCircle },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Topics", href: "/dashboard/topics", icon: Tag },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-sm"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 flex items-center justify-center">
              <NextImage
                src="/logo.png"
                alt="Wema Bank Logo"
                width={40}
                height={40}
                className="object-contain"
                style={{ height: "auto" }}
              />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">
                RT-CX Platform
              </h1>
              <p className="text-xs text-gray-500">Wema Bank</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-purple-600" : "text-gray-400"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-700 font-semibold text-sm">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
