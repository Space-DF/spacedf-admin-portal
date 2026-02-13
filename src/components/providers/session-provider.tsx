'use client';

import type { Session } from '@auth/core/types';
import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

export const NextAuthSessionProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null | undefined;
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};
