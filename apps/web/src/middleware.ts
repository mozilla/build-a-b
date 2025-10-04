import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/utils/constants';

export function middleware(request: NextRequest) {
  // Takes user to profile page /a/uuid if cookie is present
  const cookie = request.cookies.get(COOKIE_NAME);
  const hasSearchParam = request.nextUrl.searchParams.has('s');

  if (cookie && !hasSearchParam && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/a/${cookie.value}`, request.url));
  }

  return NextResponse.next();
}

// Paths where this middleware is applied
export const config = {
  matcher: ['/', '/a/:path*'],
};
