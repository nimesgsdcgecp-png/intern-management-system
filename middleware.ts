import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes - allow all
  if (pathname === "/" || pathname === "/auth/login") {
    return NextResponse.next();
  }

  // For now, let client-side auth handle protection
  // This avoids Edge Runtime issues with Node.js modules
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
