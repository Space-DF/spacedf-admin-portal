'use client';
import { Files, LogOut, Settings, SquareArrowOutUpRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import GeneralSetting from '@/components/layouts/components/account-settings';
import { useMe } from '@/components/layouts/hooks/useMe';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useRouter } from '@/i18n/routing';

const DOCUMENTATION_URL = 'https://docs.spacedf.com/';

const AccountMenu = () => {
  const t = useTranslations('common');
  const { data: user } = useMe();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSignOut = () => {
    router.replace('/');
    signOut();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.code === 'Comma'
      ) {
        event.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <GeneralSetting
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            className='flex size-9 items-center justify-center rounded-full border-[1.5px] border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-1'
          >
            <Avatar className='size-7'>
              <AvatarImage src={user?.url_avatar} alt='' />
              <AvatarFallback className='bg-brand-component-fill-secondary-soft text-xs font-medium text-brand-component-text-secondary'>
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side='bottom'
          align='end'
          className='w-[250px] rounded-xl p-1 backdrop-blur-xl'
          sideOffset={6}
        >
          <DropdownMenuLabel className='flex flex-col justify-center gap-0.5 rounded-lg border border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-2 font-normal'>
            <p className='truncate text-sm font-medium leading-5 text-brand-component-text-dark'>
              {user?.first_name} {user?.last_name}
            </p>
            <p className='truncate text-xs font-medium leading-[18px] text-brand-component-text-gray'>
              {user?.email}
            </p>
          </DropdownMenuLabel>

          <DropdownMenuGroup className='pt-1'>
            <DropdownMenuItem
              onClick={() => setIsSettingsOpen(true)}
              className='cursor-pointer gap-1.5 rounded-lg px-1.5 py-1 text-brand-component-text-dark'
            >
              <Settings size={16} className='shrink-0' />
              <span className='flex-1 text-sm font-medium leading-5'>
                {t('settings')}
              </span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className='mx-0' />

            <DropdownMenuItem
              asChild
              className='cursor-pointer gap-1.5 rounded-lg px-1.5 py-1 text-brand-component-text-dark'
            >
              <a
                href={DOCUMENTATION_URL}
                target='_blank'
                rel='noreferrer nofollow'
              >
                <Files size={16} className='shrink-0' />
                <span className='flex-1 text-sm font-medium leading-5'>
                  {t('documentation')}
                </span>
                <SquareArrowOutUpRight size={16} className='shrink-0' />
              </a>
            </DropdownMenuItem>

            <DropdownMenuSeparator className='mx-0' />

            <DropdownMenuItem
              onClick={handleSignOut}
              className='cursor-pointer gap-1.5 rounded-lg bg-brand-component-fill-accent-soft px-1.5 py-1 text-brand-component-text-accent focus:bg-brand-component-hover-accent-soft focus:text-brand-component-text-accent'
            >
              <LogOut size={16} className='shrink-0' />
              <span className='flex-1 text-sm font-medium leading-5'>
                {t('sign_out')}
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AccountMenu;
