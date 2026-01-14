import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

import { locales } from './request';

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
