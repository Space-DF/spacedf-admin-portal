'use client';
import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';

import { SidebarMenuItem } from '@/components/ui/sidebar';

import { Link, usePathname } from '@/i18n/routing';

interface Props {
  label: string;
  href: string;
  icon: string;
  open: boolean;
}

const SidebarItem: React.FC<Props> = ({ open, label, href, icon }) => {
  const pathName = usePathname();
  const isFocus = pathName.includes(href);
  return (
    <SidebarMenuItem>
      <Link
        key={label}
        href={href}
        className={cn(
          'flex items-center gap-x-2 text-brand-component-text-dark text-sm font-medium p-2 transition-all rounded-[10px] group hover:bg-brand-component-fill-dark-soft duration-150 ',
          isFocus && 'bg-brand-component-fill-dark-soft',
          !open && 'mx-auto w-fit',
        )}
      >
        <div
          className={cn(
            'flex justify-center items-center',
            open && 'w-full justify-between',
          )}
        >
          <div className='flex items-center gap-x-2'>
            <Image
              src={icon}
              width={16}
              height={16}
              alt='sidebar-icon'
              className={cn(
                'group-hover:text-brand-component-text-dark text-brand-component-text-dark',
                isFocus && 'text-brand-component-text-dark',
              )}
            />
            {open && (
              <span
                className={cn(
                  'group-hover:text-brand-component-text-dark text-brand-component-text-dark text-[14px]',
                  isFocus && 'text-brand-component-text-dark',
                )}
              >
                {label}
              </span>
            )}
          </div>
        </div>
      </Link>
    </SidebarMenuItem>
  );
};

export default SidebarItem;
