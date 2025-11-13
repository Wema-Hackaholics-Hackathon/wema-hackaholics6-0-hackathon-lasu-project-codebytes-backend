import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/dashboard/analytics",
  "/dashboard/feedback",
  "/dashboard/topics",
  "/dashboard/alerts",
  "/dashboard/users",
  "/dashboard/settings",
];

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/", "/customer"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith("/customer")
  );

  // Get the auth token from cookies or headers
  const token = request.cookies.get("auth_token")?.value;

  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/register with a token, redirect to dashboard
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
