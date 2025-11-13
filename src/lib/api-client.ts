// API client for RT-CX Platform Backend
import {
  ApiResponse,
  PaginatedResponse,
  Feedback,
  CreateFeedbackDTO,
  FeedbackFilter,
  DashboardStats,
  Alert,
  SentimentAnalysis,
  Topic,
  User,
  AuthResponse,
  LoginDTO,
} from "./types/api";

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(
    baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  ) {
    this.baseURL = baseURL;

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }

    console.log("API Client initialized with baseURL:", this.baseURL);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "10000")
    );

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(
          errorData.error?.message ||
            errorData.message ||
            `HTTP ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth methods
  async register(credentials: {
    email: string;
    password: string;
    name?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("refresh_token", response.data.refreshToken);
      }
    }

    return response.data!;
  }

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("refresh_token", response.data.refreshToken);
      }
    }

    return response.data!;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    if (response.data?.token) {
      this.token = response.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("refresh_token", response.data.refreshToken);
      }
    }

    return response.data!;
  }

  async logout(): Promise<void> {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;

    if (refreshToken) {
      try {
        await this.request("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn("Logout request failed:", error);
      }
    }

    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.request<User>("/api/v1/auth/me");
    return response.data!;
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.request("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Dashboard methods
  async getDashboardStats(timeRange?: string): Promise<DashboardStats> {
    const params = timeRange ? `?timeRange=${timeRange}` : "";
    const response = await this.request<DashboardStats>(
      `/api/v1/dashboard/stats${params}`
    );
    return response.data!;
  }

  async getSentimentTrends(days: number = 7): Promise<any[]> {
    const response = await this.request<any[]>(
      `/api/v1/dashboard/sentiment-trends?days=${days}`
    );
    return response.data!;
  }

  async getChannelPerformance(): Promise<any[]> {
    const response = await this.request<any[]>(
      "/api/v1/dashboard/channel-performance"
    );
    return response.data!;
  }

  async getEmotionBreakdown(): Promise<any[]> {
    const response = await this.request<any[]>(
      "/api/v1/dashboard/emotion-breakdown"
    );
    return response.data!;
  }

  async getGeographicData(): Promise<any[]> {
    const response = await this.request<any[]>("/api/v1/dashboard/geographic");
    return response.data!;
  }

  async getJourneyAnalytics(): Promise<any> {
    const response = await this.request<any>(
      "/api/v1/dashboard/journey-analytics"
    );
    return response.data!;
  }

  // Feedback methods
  async getFeedback(
    filters?: FeedbackFilter,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Feedback>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add filter parameters only if they exist
    if (filters) {
      if (filters.channel) params.append("channel", filters.channel);
      if (filters.sentiment) params.append("sentiment", filters.sentiment);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.customerSegment)
        params.append("customerSegment", filters.customerSegment);
      if (filters.processed !== undefined)
        params.append("processed", filters.processed.toString());
    }

    const response = await this.request<PaginatedResponse<Feedback>>(
      `/api/v1/feedback?${params}`
    );
    return response.data!;
  }

  async createFeedback(feedback: CreateFeedbackDTO): Promise<Feedback> {
    const response = await this.request<Feedback>("/api/v1/feedback", {
      method: "POST",
      body: JSON.stringify(feedback),
    });
    return response.data!;
  }

  async getFeedbackById(id: string): Promise<Feedback> {
    const response = await this.request<Feedback>(`/api/v1/feedback/${id}`);
    return response.data!;
  }

  // Alert methods
  async getAlerts(status?: string): Promise<Alert[]> {
    const params = status ? `?status=${status}` : "";
    const response = await this.request<Alert[]>(`/api/v1/alerts${params}`);
    return response.data!;
  }

  async getAlertById(id: string): Promise<Alert> {
    const response = await this.request<Alert>(`/api/v1/alerts/${id}`);
    return response.data!;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    const response = await this.request<Alert>(`/api/v1/alerts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async updateAlertStatus(id: string, status: string): Promise<Alert> {
    const response = await this.request<Alert>(`/api/v1/alerts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return response.data!;
  }

  async assignAlert(id: string, userId: string): Promise<Alert> {
    const response = await this.request<Alert>(`/api/v1/alerts/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    return response.data!;
  }

  async resolveAlert(id: string, resolution: string): Promise<Alert> {
    const response = await this.request<Alert>(`/api/v1/alerts/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution }),
    });
    return response.data!;
  }

  // Topic methods
  async getTopics(): Promise<Topic[]> {
    const response = await this.request<Topic[]>("/api/v1/topics");
    return response.data!;
  }

  async getTopicById(id: string): Promise<Topic> {
    const response = await this.request<Topic>(`/api/v1/topics/${id}`);
    return response.data!;
  }

  async createTopic(topicData: {
    name: string;
    description?: string;
    category?: string;
  }): Promise<Topic> {
    const response = await this.request<Topic>("/api/v1/topics", {
      method: "POST",
      body: JSON.stringify(topicData),
    });
    return response.data!;
  }

  async updateTopic(
    id: string,
    updates: {
      name?: string;
      description?: string;
      category?: string;
    }
  ): Promise<Topic> {
    const response = await this.request<Topic>(`/api/v1/topics/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteTopic(id: string): Promise<void> {
    await this.request<void>(`/api/v1/topics/${id}`, {
      method: "DELETE",
    });
  }

  async mergeTopics(
    sourceTopicIds: string[],
    targetTopicId: string
  ): Promise<Topic> {
    const response = await this.request<Topic>("/api/v1/topics/merge", {
      method: "POST",
      body: JSON.stringify({ sourceTopicIds, targetTopicId }),
    });
    return response.data!;
  }

  async getTrendingTopics(hours: number = 24): Promise<any[]> {
    const response = await this.request<any[]>(
      `/api/v1/topics/trending?hours=${hours}`
    );
    return response.data!;
  }

  // User methods
  async getUsers(
    filters?: {
      role?: string;
      isActive?: boolean;
      search?: string;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters) {
      if (filters.role) params.append("role", filters.role);
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive.toString());
      if (filters.search) params.append("search", filters.search);
    }

    const response = await this.request<PaginatedResponse<User>>(
      `/api/v1/users?${params}`
    );
    return response.data!;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.request<User>(`/api/v1/users/${id}`);
    return response.data!;
  }

  async createUser(userData: {
    email: string;
    password: string;
    name?: string;
    role?: string;
  }): Promise<User> {
    const response = await this.request<User>("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data!;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const response = await this.request<User>(`/api/v1/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return response.data!;
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/v1/users/${id}`, {
      method: "DELETE",
    });
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response = await this.request<User>(`/api/v1/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
    return response.data!;
  }

  // Audio/Voice methods
  async uploadAudio(
    audioFile: File,
    metadata?: Record<string, any>
  ): Promise<Feedback> {
    const formData = new FormData();
    formData.append("audio", audioFile);
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const url = `${this.baseURL}/api/v1/audio/upload`;
    const config: RequestInit = {
      method: "POST",
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      return data.data!;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Audio upload error:", error);
      }
      throw error;
    }
  }

  async getAudioStream(feedbackId: string): Promise<string> {
    return `${this.baseURL}/api/v1/audio/${feedbackId}/stream`;
  }

  async deleteAudio(feedbackId: string): Promise<void> {
    await this.request(`/api/v1/audio/${feedbackId}`, {
      method: "DELETE",
    });
  }

  // Real-time methods
  async getRealtimeMetrics(): Promise<any> {
    const response = await this.request<any>("/api/v1/dashboard/realtime");
    return response.data!;
  }

  // Error tracking methods
  async reportError(errorData: any): Promise<void> {
    await this.request("/api/v1/errors", {
      method: "POST",
      body: JSON.stringify(errorData),
    });
  }

  async getErrorStats(): Promise<any> {
    const response = await this.request<any>("/api/v1/errors/stats");
    return response.data!;
  }

  async getDropOffAnalytics(): Promise<any[]> {
    const response = await this.request<any[]>("/api/v1/analytics/drop-off");
    return response.data!;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.request<{
      status: string;
      timestamp: string;
    }>("/health");
    return response.data!;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
