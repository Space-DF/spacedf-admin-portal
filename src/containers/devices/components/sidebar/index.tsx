'use client';
import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { SidebarCollapsedSimple, SidebarSimpleIcon } from '@/components/icons';
import GeneralSetting from '@/components/layouts/components/account-settings';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import SidebarItem from '@/containers/devices/components/sidebar/components/sidebar-item';
import { useOrganization } from '@/containers/devices/components/sidebar/hooks/useOrganization';

import { getColorText, getShortName, textToHexColor } from '@/utils';

import deviceIcon from '/public/images/device.svg';

interface Props {
  isOpen: boolean;
}

const OrganizationSidebar = ({ isOpen }: Props) => {
  const [open, setOpen] = useState(isOpen);
  const { data: organization, isLoading } = useOrganization();
  const { data: user, isLoading: isLoadingUser } = useMe();
  const t = useTranslations('common');
  const router = useRouter();
  const [isOpenGeneralSetting, setIsOpenGeneralSetting] = useState(false);

  const organizationName = organization?.name || '';
  const userName = user ? `${user.first_name} ${user.last_name}` : '';

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <Sidebar collapsible='icon'>
      <GeneralSetting
        isOpen={isOpenGeneralSetting}
        onOpenChange={setIsOpenGeneralSetting}
      />
      <div className='h-full border-r border-brand-component-stroke-dark-soft flex flex-col overflow-y-auto bg-background shadow-sm'>
        <div className='mx-5 pt-5 pb-3 border-b border-brand-component-stroke-dark-soft'>
          <div
            className={cn(
              'flex items-center',
              open ? 'space-x-3' : 'space-y-3 flex-col',
            )}
          >
            <div
              className={cn(
                'flex items-center border rounded-xl border-brand-component-stroke-dark-soft p-1 font-semibold',
                open && 'pr-4 space-x-2 w-full',
              )}
            >
              {isLoading ? (
                <Skeleton className='size-10 rounded-lg' />
              ) : (
                <div
                  className='bg-brand-component-fill-secondary-soft size-10 flex items-center justify-center text-brand-component-text-secondary rounded-lg'
                  style={{
                    background: textToHexColor(organizationName),
                    color:
                      getColorText(textToHexColor(organizationName)) ||
                      '#4006AA',
                  }}
                >
                  {getShortName(organizationName)}
                </div>
              )}
              {open &&
                (isLoading ? (
                  <Skeleton className='w-14 h-2' />
                ) : (
                  <p className='text-[14px] text-brand-heading font-semibold leading-tight max-w-24 truncate'>
                    {organizationName}
                  </p>
                ))}
            </div>
            <SidebarTrigger
              onClick={() => setOpen((prev) => !prev)}
              icon={
                open ? (
                  <SidebarSimpleIcon className='cursor-pointer justify-self-end text-brand-text-gray' />
                ) : (
                  <SidebarCollapsedSimple className='col-span-1 cursor-pointer justify-self-end text-brand-text-gray' />
                )
              }
            />
          </div>
        </div>
        <SidebarContent>
          <div className='flex flex-col w-full px-2'>
            <SidebarGroup>
              <SidebarMenu className='flex flex-col w-full space-y-1 mt-4  overflow-hidden'>
                <SidebarItem
                  open={open}
                  label='Device Hub'
                  href='/devices'
                  icon={deviceIcon}
                />
              </SidebarMenu>
            </SidebarGroup>
          </div>
        </SidebarContent>
        <SidebarFooter className='mt-auto border-t border-brand-component-stroke-dark-soft p-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center w-full rounded-lg p-2 hover:bg-brand-fill-dark-soft transition-colors',
                  open ? 'gap-3' : 'justify-center',
                )}
              >
                {isLoadingUser ? (
                  <Skeleton className='size-9 rounded-full' />
                ) : (
                  <Avatar className='size-9'>
                    <AvatarImage src={user?.avatar} alt={userName} />
                    <AvatarFallback
                      className='text-sm font-medium'
                      style={{
                        background: textToHexColor(userName),
                        color:
                          getColorText(textToHexColor(userName)) || '#4006AA',
                      }}
                    >
                      {getShortName(userName)}
                    </AvatarFallback>
                  </Avatar>
                )}
                {open && (
                  <div className='flex flex-col items-start overflow-hidden'>
                    {isLoadingUser ? (
                      <>
                        <Skeleton className='w-20 h-3 mb-1' />
                        <Skeleton className='w-24 h-2' />
                      </>
                    ) : (
                      <>
                        <span className='text-sm font-medium text-brand-heading truncate max-w-[120px]'>
                          {userName}
                        </span>
                        <span className='text-xs text-brand-text-gray truncate max-w-[120px]'>
                          {user?.email}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side='top'
              align='start'
              className='w-56 rounded-lg'
              sideOffset={8}
            >
              <DropdownMenuItem
                onClick={() => setIsOpenGeneralSetting(true)}
                className='cursor-pointer flex items-center gap-2 px-3 py-2'
              >
                <Settings size={16} className='text-brand-icon-gray' />
                <span className='text-sm'>{t('account_settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className='cursor-pointer flex items-center gap-2 px-3 py-2 text-brand-semantic-accent'
              >
                <LogOut size={16} />
                <span className='text-sm'>{t('sign_out')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
};

export default OrganizationSidebar;
