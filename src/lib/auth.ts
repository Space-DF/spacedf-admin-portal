import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

import api from '@/lib/api';

import { NEXTAUTH_SECRET } from '@/shared/env';
import { setServerSession } from '@/utils';

import { AuthToken } from '@/types';

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
        sigUpSuccessfully: { label: 'signUpSuccess', type: 'boolean' },
        dataUser: { label: 'DataUser', type: 'string' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { sigUpSuccessfully, dataUser } = credentials;
        if (sigUpSuccessfully === 'true') {
          return JSON.parse(dataUser as string);
        }
        try {
          const response = await api.post<AuthToken>(
            '/console/auth/login',
            credentials,
          );
          setServerSession(
            'default_organization',
            response.default_organization,
          );
          return response;
        } catch {
          return null;
        }
      },
    }),
  ],
  trustHost: true,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.access = token.access;
        session.user.refresh = token.refresh;
      }

      return {} as Session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        const newRefreshToken = await api.post<JWT>(
          '/console/auth/organizations/switch',
          {
            organization: session.organization,
            refresh: token.refresh,
          },
        );
        return {
          ...token,
          access: newRefreshToken.access as string,
          refresh: newRefreshToken.refresh,
          error: undefined,
        };
      }
      if (user) {
        token.access = user.access;
        token.refresh = user.refresh;
      }
      return token;
    },
  },
});
