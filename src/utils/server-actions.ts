'use server';
import { cookies } from 'next/headers';
import { Session } from 'next-auth';
import { decode } from 'next-auth/jwt';

import { NEXTAUTH_SECRET } from '@/shared/env';
import { isJsonString } from '@/utils';

export const getCookieServer = <TDefaultValue = unknown>(
  key: string,
  defaultValue: TDefaultValue,
) => {
  const cookie = cookies().get(key);

  if (cookie)
    return isJsonString(cookie.value)
      ? JSON.parse(cookie.value)
      : (cookie.value as TDefaultValue);

  return defaultValue;
};

export const getServerOrganization = async () => {
  const cookieStore = await cookies();
  return (cookieStore.get('default_organization')?.value || '') as string;
};

export const getServerSpace = () => {
  const cookieStore = cookies();
  return (cookieStore.get('space')?.value || '') as string;
};

const SESSION_SECURE = process.env.NEXTAUTH_URL?.startsWith('https://');
const SESSION_SALT = SESSION_SECURE
  ? '__Secure-authjs.session-token'
  : 'authjs.session-token';

export async function readSession(): Promise<Session | null> {
  try {
    // This handles chunked cookies (.0, .1, .2, etc.) for large sessions
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    // Find the main session cookie or chunked cookies
    const sessionCookie = cookieStore.get(SESSION_SALT);
    const chunkedCookies = allCookies
      .filter((cookie) => cookie.name.startsWith(`${SESSION_SALT}.`))
      .sort((a, b) => {
        // Sort by chunk number (.0, .1, .2, etc.)
        const aNum = parseInt(a.name.split('.').pop() || '0', 10);
        const bNum = parseInt(b.name.split('.').pop() || '0', 10);
        return aNum - bNum;
      });

    let encodedSession: string | null = null;

    if (chunkedCookies.length > 0) {
      encodedSession = chunkedCookies.map((cookie) => cookie.value).join('');
    } else if (sessionCookie) {
      encodedSession = sessionCookie.value;
    }

    if (!encodedSession) {
      return null;
    }

    const session = await decode({
      token: encodedSession,
      secret: NEXTAUTH_SECRET as string,
      salt: SESSION_SALT,
    });

    return { user: session } as unknown as Session;
  } catch {
    return null;
  }
}

export async function setServerSession(key: string, value: string) {
  const cookieStore = cookies();
  cookieStore.set(key, value);
}
