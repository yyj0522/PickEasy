import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    const ALLOWED_DOMAINS = [
      'https://www.easypick-ai.com',
      'http://localhost:3000', 
    ];

    const isAllowedOrigin = origin && ALLOWED_DOMAINS.some(domain => origin.startsWith(domain));
    const isAllowedReferer = referer && ALLOWED_DOMAINS.some(domain => referer.startsWith(domain));

    if (origin && !isAllowedOrigin) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized Origin' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!origin && referer && !isAllowedReferer) {
      return new NextResponse(JSON.stringify({ message: 'Unauthorized Referer' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};