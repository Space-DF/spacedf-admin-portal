import { ChevronsUpDown, LogOut, Moon, Sun } from 'lucide-react';
import { Suspense } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import {
  OrganizationLogo,
  SettingIcon,
  SidebarSimpleIcon,
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { NavigationData } from '@/containers/white-label/brand-customization/components/brand-style-preview/constants';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';

const THEME_LIST = ['Light', 'Dark'];

export const Sidebar = () => {
  const { theme: resolvedTheme, setTheme } = useBrandStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
    })),
  );

  return (
    <div
      className='flex border-r py-4 text-sm shadow-md transition-all duration-300 border-[--border-color] text-[--text-color]'
      id='sidebar-id'
    >
      <div
        className={cn(
          'flex grow flex-col transition-all duration-300',
          'w-full translate-x-0 animate-opacity-display-effect opacity-100',
        )}
      >
        <div className='flex-1'>
          <div className='flex items-center justify-between gap-3 mb-3 px-2'>
            <div className='min-w-14 flex-1'>
              <div className='flex cursor-pointer items-center justify-between gap-2 border p-1 rounded-[--input-border-radius] text-[--text-color] border-[--border-color]'>
                <div className='flex gap-2 items-center'>
                  <Avatar className='flex items-center justify-center rounded-[--input-border-radius] bg-purple-200 dark:bg-purple-700 size-10'>
                    <AvatarImage
                      src='/images/space-logo.png'
                      alt='Space Name'
                      className='size-full object-contain rounded-[--input-border-radius]'
                    />
                    <Suspense fallback={<AvatarFallback>LG</AvatarFallback>}>
                      <OrganizationLogo className='text-purple-900 dark:text-purple-400' />
                    </Suspense>
                  </Avatar>
                  <div className='flex flex-col items-start justify-between font-medium'>
                    <p
                      className={cn(
                        'text-sm font-semibold w-full wrap-anywhere line-clamp-1 text-[--text-color]',
                      )}
                    >
                      Space Name
                    </p>
                  </div>
                </div>
                <ChevronsUpDown
                  size={20}
                  className='text-[--support-text-color]'
                />
              </div>
            </div>
            <SidebarSimpleIcon className='cursor-pointer justify-self-end text-[--support-text-color]' />
          </div>

          <div className='flex flex-col space-y-1 mx-2'>
            {NavigationData.map((navigation) => (
              <div
                key={navigation.key}
                className={cn(
                  'flex w-full items-center justify-between py-[2px] px-2',
                  navigation.isDisplay && 'bg-[--accent-color] rounded-lg',
                )}
              >
                <label
                  className={cn(
                    'flex flex-1 cursor-pointer items-center gap-2 overflow-hidden duration-300 text-[--accent-text-color]',
                  )}
                  htmlFor={navigation.href}
                >
                  <div className='duration-200 text-[--accent-text-color]'>
                    {navigation.icon}
                  </div>
                  <div className='max-w-[90%] flex-1 truncate p-1'>
                    {navigation.title}
                  </div>
                </label>

                {navigation.isDynamic && (
                  <Checkbox
                    id={navigation.href}
                    defaultChecked={navigation.isDisplay}
                    checked={navigation.isDisplay}
                    className='pointer-events-none data-[state=checked]:bg-[--primary-color] data-[state=checked]:border-[--primary-color] data-[state=checked]:text-[--primary-text-color]'
                    tabIndex={-1}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-col gap-1 px-2'>
          <Button
            variant='ghost'
            className='h-8 justify-start gap-2 p-0 duration-300 hover:bg-transparent text-[--support-text-color]'
          >
            <SettingIcon className='text-[--support-text-color]' />
            <p className='text-sm'>General Setting</p>
          </Button>

          <Button
            variant='ghost'
            className='h-8 justify-start gap-2 p-0 text-[--support-text-color] duration-300 hover:bg-transparent  rounded-[--button-border-radius]  '
          >
            <LogOut size={16} />
            <p className='text-sm'>Sign out</p>
          </Button>

          <div className='flex w-full bg-[--switch-background-color] p-1 border border-[--border-color] rounded-[--input-border-radius]'>
            {THEME_LIST.map((theme) => {
              const currentTheme = theme.toLowerCase();
              const isActive = currentTheme === resolvedTheme;

              return (
                <div
                  key={currentTheme}
                  onClick={() => {
                    if (resolvedTheme === currentTheme) return;
                    setTheme(currentTheme as 'light' | 'dark');
                  }}
                  className={cn(
                    'flex flex-1 cursor-pointer items-center justify-center gap-2 p-1 capitalize duration-300 rounded-[calc(var(--input-border-radius)-2px)]',
                    isActive ? 'bg-[--background-color]' : 'bg-transparent',
                    isActive
                      ? 'text-[--text-color]'
                      : 'text-[--support-text-color]',
                  )}
                >
                  {currentTheme === 'light' ? (
                    <Sun
                      size={16}
                      className={cn(
                        'duration-300',
                        isActive
                          ? 'fill-[--text-color] text-[--text-color]'
                          : 'fill-transparent text-[--support-text-color]',
                      )}
                    />
                  ) : (
                    <Moon
                      size={16}
                      className={cn(
                        'duration-300',
                        isActive
                          ? 'fill-[--text-color] text-[--text-color]'
                          : 'fill-transparent text-[--support-text-color]',
                      )}
                    />
                  )}
                  <p
                    className={cn(
                      'text-xs',
                      isActive
                        ? 'text-[--text-color]'
                        : 'text-[--support-text-color]',
                    )}
                  >
                    {theme}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
