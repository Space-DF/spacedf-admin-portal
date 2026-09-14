'use client';

import type { Session } from '@auth/core/types';
import { PropsWithChildren } from 'react';

import { Toaster } from '@/components/ui/sonner';

import NextThemeProvider from './next-theme';
import ReactQueryProvider from './react-query-provider';
import { NextAuthSessionProvider } from './session-provider';

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null;
}) => {
  return (
    <NextThemeProvider>
      <NextAuthSessionProvider session={session}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster position='top-right' richColors />
      </NextAuthSessionProvider>
    </NextThemeProvider>
  );
};

export default AppProvider;
