import { type NextRequest, NextResponse } from 'next/server';
import { adminCookieName } from '@/features/admin/cookie';

const contentSecurityPolicy = (nonce: string, development: boolean, secure: boolean) =>
  [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    secure ? 'upgrade-insecure-requests' : '',
  ]
    .filter(Boolean)
    .join('; ');

/**
 * 1. Optimistic admin gate: without a session cookie, /admin pages redirect to
 *    the login. The real authorisation check runs on the server in every
 *    admin page and Server Action.
 * 2. A fresh CSP nonce per request; Next.js applies it to its own scripts.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const siteUrl = process.env.SITE_URL;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !request.cookies.has(adminCookieName(siteUrl))) {
    const login = request.nextUrl.clone();
    login.pathname = '/admin/login';
    login.search = '';
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === 'development', (siteUrl ?? '').startsWith('https://'));
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', policy);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|images/|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
