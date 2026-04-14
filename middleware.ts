import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/repos") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/topics") ||
    pathname.startsWith("/goals")

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*", "/repos/:path*", "/settings/:path*", "/topics/:path*", "/goals/:path*"],
}

