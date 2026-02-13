'use client';

import type { Session } from '@auth/core/types';
import { PropsWithChildren } from 'react';
import { SWRDevTools } from 'swr-devtools';

import { Toaster } from '@/components/ui/sonner';

import NextThemeProvider from './next-theme';
import { NextAuthSessionProvider } from './session-provider';
import SWRProvider from './swr-provider';

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null;
}) => {
  return (
    <SWRDevTools>
      <NextThemeProvider>
        <NextAuthSessionProvider session={session}>
          <SWRProvider>{children}</SWRProvider>
          <Toaster position='top-right' richColors />
        </NextAuthSessionProvider>
      </NextThemeProvider>
    </SWRDevTools>
  );
};

export default AppProvider;
