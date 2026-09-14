import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import '@/styles/globals.css';

import AppProvider from '@/components/providers';

import { routing } from '@/i18n/routing';
import { readSession } from '@/utils';

export const metadata: Metadata = {
  title: 'SpaceDF - No-Code IoT Management Platform',
  description:
    'SpaceDF is a ready-to-use IoT platform that lets you connect, manage, and control all your devices from a single dashboard with no-code and minimal setup. Easily turn it into a white-label solution under your own brand!',
  openGraph: {
    images: ['https://d33et8skld5wvq.cloudfront.net/images/spacedf-og.jpg'],
    siteName: 'SpaceDF',
  },
  twitter: {
    images: ['https://d33et8skld5wvq.cloudfront.net/images/spacedf-og.jpg'],
  },
  keywords: [
    'IoT Platform',
    'IoT device management',
    'White-label IoT solution',
    'IoT management solution',
    'GPS tracking solution',
    'flood tracking solution',
    'Fleet management IoT platform',
    'No-code platform',
    'device monitoring solution',
    'Customizable IoT platform',
    'Real-time IoT monitoring',
    'white label SaaS platform',
    'smart device management',
    'best IoT management platform',
    'best white label IoT platform',
    'no-code IoT dashboard',
    'flood map',
  ],
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const [messages, session] = await Promise.all([getMessages(), readSession()]);

  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider session={session}>{children}</AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
