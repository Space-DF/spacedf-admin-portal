'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

import { SidebarMenuItem } from '@/components/ui/sidebar';

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
          'flex items-center gap-x-2 text-brand-component-text-gray text-sm font-[500] p-2 transition-all rounded-md group mx-2 hover:bg-brand-component-fill-dark-soft duration-150',
          isFocus && 'bg-brand-component-fill-dark-soft',
        )}
      >
        <div
          className={cn(
            'flex  justify-center items-center w-full',
            open && 'justify-between',
          )}
        >
          <div className='flex items-center gap-x-2'>
            <Image
              src={icon}
              width={20}
              height={20}
              alt='sidebar-icon'
              className={cn(
                'group-hover:text-brand-component-text-dark',
                isFocus && 'text-brand-component-text-dark',
              )}
            />
            {open && (
              <span
                className={cn(
                  'group-hover:text-brand-component-text-dark',
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
