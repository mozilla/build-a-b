import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME } from '@/utils/constants';

export function middleware(request: NextRequest) {
  // Handle /game route - rewrite to static game assets
  if (request.nextUrl.pathname.startsWith('/game')) {
    const path =
      request.nextUrl.pathname === '/game'
        ? '/assets/game/index.html'
        : request.nextUrl.pathname.replace('/game', '/assets/game');

    return NextResponse.rewrite(new URL(path, request.url));
  }

  // Takes user to profile page /a/uuid if cookie is present
  const cookie = request.cookies.get(COOKIE_NAME);
  const hasSearchParam = request.nextUrl.searchParams.has('s');
  const uuid = request.nextUrl.pathname.includes('/a/')
    ? request.nextUrl.pathname.replace('/a/', '')
    : null;

  if (cookie && !hasSearchParam && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(`/a/${cookie.value}`, request.url));
  }

  if (uuid && cookie?.value !== uuid) {
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, uuid);
    return response;
  }

  return NextResponse.next();
}

// Paths where this middleware is applied
export const config = {
  matcher: ['/', '/a/:path*', '/game/:path*'],
};
