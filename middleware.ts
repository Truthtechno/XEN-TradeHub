import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is for the old trade-kojo route
  if (request.nextUrl.pathname === '/trade-kojo') {
    // Create a redirect response to the new trade-core route
    return NextResponse.redirect(new URL('/trade-core', request.url))
  }

  // For any other routes, continue normally
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/trade-kojo',
    '/trade-kojo/:path*'
  ]
}
