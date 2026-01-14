import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { locales } from '@/i18n/request';
import { readSession } from '@/utils';

import { Locale } from '@/types/global';

const PUBLIC_FILE = /\.(.*)$/; // Files

// Define route patterns
const AUTH_ROUTES = ['/auth/sign-in', '/auth/sign-up'];
const STARTED_ROUTE = ['/'];

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return;

  // Step 1: Use the incoming request (example)
  const defaultLocale = (cookies().get('NEXT_LOCALE')?.value || 'en') as Locale;

  let [, locale, ...segments] = request.nextUrl.pathname.split('/');

  const isLocaleValid = locales.includes(locale as Locale);

  // If the first segment isn't a valid locale, default to the defaultLocale
  if (!isLocaleValid) {
    locale = defaultLocale;
    segments = url.pathname.split('/').filter(Boolean); // Reset segments without locale
  }

  // Construct the path without locale for matching
  const pathWithoutLocale = `/${segments.join('/')}`;

  // Step 2: Check authentication
  const session = await readSession();

  // Step 3: Handle authentication logic
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathWithoutLocale.startsWith(route),
  );
  const isStartedRoute = STARTED_ROUTE.includes(pathWithoutLocale);

  const isProtectedRoute = !isAuthRoute && !isStartedRoute;

  // If user is authenticated and trying to access auth routes or landing page
  if (session && (isAuthRoute || isStartedRoute)) {
    const redirectUrl = new URL(`/${locale}/devices`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is not authenticated and trying to access protected routes
  if (!session && (isProtectedRoute || isStartedRoute)) {
    const redirectUrl = new URL(`/${locale}/auth/sign-in`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
  });

  request.nextUrl.pathname = `/${locale}/${segments.join('/') || ''}`;

  const response = handleI18nRouting(request);

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(vi|en)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
};
