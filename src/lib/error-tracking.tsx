// Error tracking and analytics utilities

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  severity: "low" | "medium" | "high" | "critical";
  tags?: Record<string, string>;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  pages: PageVisit[];
  errors: ErrorReport[];
  userAgent: string;
  referrer?: string;
}

export interface PageVisit {
  url: string;
  title: string;
  timestamp: Date;
  timeOnPage?: number;
  exitType?: "navigation" | "close" | "refresh" | "error";
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private sessionId: string;
  private userId?: string;
  private currentSession: UserSession;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.currentSession = {
      sessionId: this.sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      pages: [],
      errors: [],
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "",
      referrer: typeof window !== "undefined" ? document.referrer : undefined,
    };

    if (typeof window !== "undefined") {
      this.setupErrorHandlers();
      this.setupPageTracking();
    }
  }

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener("error", (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        line: event.lineno,
        column: event.colno,
        severity: "high",
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: "medium",
      });
    });

    // React error boundary integration
    if (typeof window !== "undefined") {
      (window as any).__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
        onBuildError: (error: Error) => {
          this.captureError({
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            severity: "critical",
          });
        },
      };
    }
  }

  private setupPageTracking() {
    // Track page visits
    this.trackPageVisit();

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.updateLastPageVisit("navigation");
      }
    });

    // Track beforeunload
    window.addEventListener("beforeunload", () => {
      this.updateLastPageVisit("close");
      this.sendSessionData();
    });

    // Track navigation (for SPAs)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.updateLastPageVisit("navigation");
      originalPushState.apply(history, args);
      setTimeout(() => this.trackPageVisit(), 0);
    };

    history.replaceState = (...args) => {
      this.updateLastPageVisit("navigation");
      originalReplaceState.apply(history, args);
      setTimeout(() => this.trackPageVisit(), 0);
    };

    window.addEventListener("popstate", () => {
      this.updateLastPageVisit("navigation");
      setTimeout(() => this.trackPageVisit(), 0);
    });
  }

  private trackPageVisit() {
    const pageVisit: PageVisit = {
      url: window.location.href,
      title: document.title,
      timestamp: new Date(),
    };

    this.currentSession.pages.push(pageVisit);
    this.currentSession.lastActivity = new Date();
  }

  private updateLastPageVisit(exitType: PageVisit["exitType"]) {
    const lastPage =
      this.currentSession.pages[this.currentSession.pages.length - 1];
    if (lastPage && !lastPage.timeOnPage) {
      lastPage.timeOnPage = Date.now() - lastPage.timestamp.getTime();
      lastPage.exitType = exitType;
    }
  }

  captureError(errorData: {
    message: string;
    stack?: string;
    componentStack?: string;
    url?: string;
    line?: number;
    column?: number;
    severity: ErrorReport["severity"];
    tags?: Record<string, string>;
  }) {
    const error: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorData.message,
      stack: errorData.stack,
      componentStack: errorData.componentStack,
      url:
        errorData.url ||
        (typeof window !== "undefined" ? window.location.href : ""),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "",
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
      severity: errorData.severity,
      tags: errorData.tags,
    };

    this.currentSession.errors.push(error);
    this.currentSession.lastActivity = new Date();

    // Send error immediately for critical errors
    if (errorData.severity === "critical") {
      this.sendErrorReport(error);
    }

    console.error("Error captured:", error);
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.currentSession.userId = userId;
  }

  addTag(key: string, value: string) {
    // Add tags to future errors
    if (!this.currentSession.errors.length) return;

    const lastError =
      this.currentSession.errors[this.currentSession.errors.length - 1];
    if (!lastError.tags) lastError.tags = {};
    lastError.tags[key] = value;
  }

  private async sendErrorReport(error: ErrorReport) {
    try {
      // In a real implementation, send to your error tracking service
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(error),
      });
    } catch (e) {
      console.error("Failed to send error report:", e);
    }
  }

  private async sendSessionData() {
    try {
      // In a real implementation, send to your analytics service
      await fetch("/api/analytics/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.currentSession),
      });
    } catch (e) {
      console.error("Failed to send session data:", e);
    }
  }

  getSessionData(): UserSession {
    return { ...this.currentSession };
  }

  getDropOffAnalytics() {
    const pageStats = new Map<
      string,
      {
        visits: number;
        exits: number;
        totalTime: number;
        bounces: number;
      }
    >();

    // Analyze all sessions (in real implementation, this would come from your database)
    this.currentSession.pages.forEach((page, index) => {
      const url = new URL(page.url).pathname;

      if (!pageStats.has(url)) {
        pageStats.set(url, { visits: 0, exits: 0, totalTime: 0, bounces: 0 });
      }

      const stats = pageStats.get(url)!;
      stats.visits++;

      if (page.timeOnPage) {
        stats.totalTime += page.timeOnPage;
      }

      // Check if this is an exit
      if (index === this.currentSession.pages.length - 1 || page.exitType) {
        stats.exits++;
      }

      // Check if this is a bounce (single page visit)
      if (this.currentSession.pages.length === 1) {
        stats.bounces++;
      }
    });

    return Array.from(pageStats.entries()).map(([url, stats]) => ({
      page: url,
      visits: stats.visits,
      exits: stats.exits,
      exitRate: (stats.exits / stats.visits) * 100,
      avgTimeOnPage: stats.totalTime / stats.visits / 1000, // Convert to seconds
      bounceRate: (stats.bounces / stats.visits) * 100,
    }));
  }
}

export default ErrorTracker;
