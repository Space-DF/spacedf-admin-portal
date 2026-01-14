import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import OrganizationSidebar from '@/containers/devices/components/sidebar';

import { SearchProvider } from '@/contexts/search-organization-context';
import { getCookieServer } from '@/utils';

export default async function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isOpenSidebar = await getCookieServer('sidebar_state', true);
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={isOpenSidebar}>
        <OrganizationSidebar isOpen={isOpenSidebar} />
        <SidebarInset className='bg-brand-background-fill-surface'>
          <div className='mt-6'>
            <div className='mx-10'>{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SearchProvider>
  );
}
