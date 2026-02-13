'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useCallback, useEffect } from 'react';

import { useRouter } from '@/i18n/routing';

export function useLoginSocial() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const handleGetAuthToken = useCallback(async () => {
    if (!code) return;

    try {
      const res = await fetch('/api/auth/socials/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization_code: code }),
      });

      if (!res.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const data = await res.json();

      const signInRes = await signIn('credentials', {
        redirect: false,
        sigUpSuccessfully: true,
        dataUser: JSON.stringify(data),
      });

      if (signInRes?.ok) {
        router.replace('/devices');
      } else {
        console.error('Sign in failed:', signInRes?.error);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  }, [code, router]);

  useEffect(() => {
    if (code) {
      handleGetAuthToken();
    }
  }, [code, handleGetAuthToken]);

  return { code };
}
