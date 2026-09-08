import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static resources and Next.js internal paths: Always public
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // file extensions like .ico, .png, .jpg, .svg
  ) {
    return NextResponse.next();
  }

  // 2. Explicit Public mobile and QR routes: Always open without login
  const isPublicRoute =
    pathname === '/login' ||
    pathname === '/work-permit-apply' ||
    pathname === '/worker-report' ||
    pathname === '/tbm-sign' ||
    pathname === '/apply' ||
    pathname.startsWith('/qr-permit') ||
    pathname.startsWith('/qr');

  const authSessionCookie = request.cookies.get('prism_auth_session')?.value;
  const isAuthenticated = Boolean(authSessionCookie && authSessionCookie.trim() !== '');

  // 3. If accessing /login while already authenticated, redirect to Dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 4. If accessing public QR/worker pages, allow immediately
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 5. Protected Internal Management Routes: Require login session
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
