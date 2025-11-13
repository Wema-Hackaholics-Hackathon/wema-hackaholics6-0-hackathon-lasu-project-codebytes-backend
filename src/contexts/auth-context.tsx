"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      }
    } catch (error) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important: Include cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    // Store tokens in both localStorage and set cookie
    localStorage.setItem("auth_token", data.data.token);
    localStorage.setItem("refresh_token", data.data.refreshToken);

    // Set cookie for middleware
    document.cookie = `auth_token=${data.data.token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }`; // 7 days

    // Then update user state
    setUser(data.data.user);

    return data.data;
  };
  const register = async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Registration failed");
    }

    const data = await response.json();

    localStorage.setItem("auth_token", data.data.token);
    localStorage.setItem("refresh_token", data.data.refreshToken);

    // Set cookie for middleware
    document.cookie = `auth_token=${data.data.token}; path=/; max-age=${
      7 * 24 * 60 * 60
    }`;

    setUser(data.data.user);

    return data.data;
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetch(`${API_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
      }
    } catch (error) {
      // Continue with logout even if API call fails
    }
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");

    // Clear cookie
    document.cookie =
      "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Token refresh failed");

    const data = await response.json();
    localStorage.setItem("auth_token", data.data.token);
    return data.data.token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
