import React from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import OrganizationSidebar from '@/containers/devices/components/sidebar';

import { getCookieServer } from '@/utils';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

const OrganizationLayout = async ({ children }: Props) => {
  const isOpenSidebar = await getCookieServer('sidebar_state', true);
  return (
    <SidebarProvider defaultOpen={isOpenSidebar}>
      <OrganizationSidebar />
      <SidebarInset className='bg-brand-background-fill-surface'>
        <div className='mt-6'>
          <div className='mx-10'>{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default OrganizationLayout;
