'use client';
import { House } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

import AccountMenu from '@/components/layouts/components/account-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItemType {
  label: string;
  href: string;
}

interface Props {
  title: string;
  items?: BreadcrumbItemType[];
}

const OrganizationHeader = ({ title, items = [] }: Props) => {
  const t = useTranslations('organization');

  return (
    <header className='-mx-10 -mt-6 flex items-center justify-between border-b border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost px-10 py-3'>
      <Breadcrumb>
        <BreadcrumbList className='gap-0 sm:gap-0'>
          <BreadcrumbItem>
            <BreadcrumbLink
              href='/organizations'
              className='flex items-center gap-x-1 text-body font-medium text-brand-component-text-gray-fixed'
            >
              <House className='size-4' />
              {t('organization_list')}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.map((item) => (
            <Fragment key={item.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={item.href}
                  className='text-body font-medium text-brand-component-text-gray-fixed'
                >
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='text-body font-bold text-brand-component-text-dark'>
              {title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AccountMenu />
    </header>
  );
};

export default OrganizationHeader;
