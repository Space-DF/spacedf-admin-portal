import { NextRequest, NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';

import api from '@/lib/api';
import { auth } from '@/lib/auth';

const CHUNK_SIZE = 3800; // Leave some room for cookie attributes (standard cookie size limit is 4096)

const createAuthCookieStrings = (token: string): string[] => {
  const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://');
  const SESSION_SALT = SESSION_SECURE
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  const cookieAttributes = `; Path=/; HttpOnly; SameSite=Lax${
    SESSION_SECURE ? '; Secure' : ''
  }`;

  // If token is small enough, use single cookie
  if (token.length <= CHUNK_SIZE) {
    return [`${SESSION_SALT}=${token}${cookieAttributes}`];
  }

  // Split token into chunks
  const chunks: string[] = [];
  for (let i = 0; i < token.length; i += CHUNK_SIZE) {
    const chunk = token.slice(i, i + CHUNK_SIZE);
    const chunkIndex = Math.floor(i / CHUNK_SIZE);
    chunks.push(`${SESSION_SALT}.${chunkIndex}=${chunk}${cookieAttributes}`);
  }

  return chunks;
};

const createClearCookieStrings = (): string[] => {
  const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://');
  const SESSION_SALT = SESSION_SECURE
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token';

  const expiredAttributes = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    SESSION_SECURE ? '; Secure' : ''
  }`;

  // Clear main session cookie and potential chunks (up to 10 chunks should be enough)
  const clearCookies: string[] = [];
  clearCookies.push(`${SESSION_SALT}=${expiredAttributes}`);

  for (let i = 0; i < 10; i++) {
    clearCookies.push(`${SESSION_SALT}.${i}=${expiredAttributes}`);
  }

  return clearCookies;
};

const refreshLocks = new Map<string, Promise<NextResponse>>();

export const POST = async (request: NextRequest) => {
  const abortController = new AbortController();

  // Listen for client disconnect
  request.signal.addEventListener('abort', () => {
    abortController.abort();
  });
  try {
    const session = await auth();
    const refreshToken = session?.user?.refresh;
    if (!refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (refreshLocks.has(refreshToken)) {
      return await refreshLocks.get(refreshToken)!;
    }
    if (request.signal.aborted) {
      return NextResponse.json({ error: 'Request aborted' }, { status: 499 });
    }
    const refreshPromise = (async () => {
      try {
        const data = await api.post(
          '/console/auth/refresh-token',
          {
            refresh: refreshToken,
          },
          { signal: abortController.signal },
        );

        const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://');
        const SESSION_SALT = SESSION_SECURE
          ? '__Secure-authjs.session-token'
          : 'authjs.session-token';

        const newSessionToken = await encode({
          secret: process.env.NEXTAUTH_SECRET as string,
          token: data,
          salt: SESSION_SALT,
        });

        const response = NextResponse.json(data);

        // First, clear any existing session cookies
        const clearCookies = createClearCookieStrings();
        const cookieStrings = createAuthCookieStrings(newSessionToken);

        // Combine clear cookies and new cookies
        const allCookies = [...clearCookies, ...cookieStrings];

        // Set all cookies
        allCookies.forEach((cookieString, index) => {
          if (index === 0) {
            response.headers.set('Set-Cookie', cookieString);
          } else {
            response.headers.append('Set-Cookie', cookieString);
          }
        });

        return response;
      } finally {
        refreshLocks.delete(refreshToken);
      }
    })();

    refreshLocks.set(refreshToken, refreshPromise);
    return await refreshPromise;
  } catch {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
};
