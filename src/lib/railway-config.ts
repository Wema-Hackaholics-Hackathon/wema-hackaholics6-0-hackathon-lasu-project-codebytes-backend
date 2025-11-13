// Railway deployment configuration
export const railwayConfig = {
  // Railway backend URL
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://rt-cx-backend-production.up.railway.app",
  wsUrl:
    process.env.NEXT_PUBLIC_WS_URL ||
    "wss://rt-cx-backend-production.up.railway.app",

  // API configuration
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "15000"),
  retryAttempts: 3,
  retryDelay: 1000,

  // Feature flags
  useRailwayBackend: process.env.NEXT_PUBLIC_RAILWAY_BACKEND === "true",
  enableRealtime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === "true",

  // Health check endpoints
  healthEndpoint: "/health",
  apiDocsEndpoint: "/api-docs",

  // Demo credentials (for Railway deployment)
  demoCredentials: {
    email: "admin@demo.com",
    password: "Admin@123",
  },

  // API endpoints
  endpoints: {
    auth: {
      login: "/api/v1/auth/login",
      logout: "/api/v1/auth/logout",
      refresh: "/api/v1/auth/refresh",
    },
    dashboard: {
      stats: "/api/v1/dashboard/stats",
      sentimentTrends: "/api/v1/dashboard/sentiment-trends",
      channelPerformance: "/api/v1/dashboard/channel-performance",
      emotionBreakdown: "/api/v1/dashboard/emotion-breakdown",
      geographic: "/api/v1/dashboard/geographic",
      journeyAnalytics: "/api/v1/dashboard/journey-analytics",
      realtime: "/api/v1/dashboard/realtime",
    },
    feedback: {
      list: "/api/v1/feedback",
      create: "/api/v1/feedback",
      byId: "/api/v1/feedback",
    },
    alerts: {
      list: "/api/v1/alerts",
      resolve: "/api/v1/alerts",
      update: "/api/v1/alerts",
    },
    topics: {
      list: "/api/v1/topics",
      trending: "/api/v1/topics/trending",
    },
    admin: {
      seedDemo: "/api/v1/admin/seed-demo",
      demoStats: "/api/v1/admin/demo-stats",
      resetDemo: "/api/v1/admin/reset-demo",
    },
    errors: {
      report: "/api/v1/errors",
      stats: "/api/v1/errors/stats",
    },
    analytics: {
      dropOff: "/api/v1/analytics/drop-off",
    },
  },
};

// Helper functions
export const isRailwayDeployment = () => {
  return railwayConfig.apiUrl.includes("railway.app");
};

export const getApiUrl = (endpoint: string) => {
  return `${railwayConfig.apiUrl}${endpoint}`;
};

export const getWsUrl = () => {
  return railwayConfig.wsUrl;
};

// Railway health check
export const checkRailwayHealth = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(getApiUrl(railwayConfig.healthEndpoint), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log("Railway health check:", data);
      return data.status === "healthy";
    }

    return false;
  } catch (error) {
    console.warn("Railway health check failed (using fallback):", error);
    return false;
  }
};

// Initialize Railway connection
export const initializeRailwayConnection = async () => {
  if (!isRailwayDeployment()) {
    console.log("Not using Railway deployment");
    return false;
  }

  console.log("Initializing Railway connection...");
  console.log("API URL:", railwayConfig.apiUrl);
  console.log("WebSocket URL:", railwayConfig.wsUrl);

  const isHealthy = await checkRailwayHealth();

  if (isHealthy) {
    console.log("✅ Railway backend is healthy and ready");
    return true;
  } else {
    console.warn("⚠️ Railway backend health check failed");
    return false;
  }
};

export default railwayConfig;
