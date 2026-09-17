'use client';

import { Copy, Plus, RotateCw, Share } from 'lucide-react';

import { Lock2 } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { DEFAULT_DOMAIN } from '@/containers/white-label/constants';

interface HeaderUrlProps {
  domain?: string;
  isLoading?: boolean;
}

export const HeaderUrl = ({ domain, isLoading }: HeaderUrlProps) => {
  return (
    <div className='bg-brand-component-fill-dark h-9 px-5 py-2 flex items-center gap-4 border-b border-brand-stroke-outermost select-none shrink-0'>
      <div className='flex items-center gap-1.5 shrink-0'>
        <div className='size-3 rounded-full bg-red-600' />
        <div className='size-3 rounded-full bg-yellow-500' />
        <div className='size-3 rounded-full bg-green-500' />
      </div>

      <div className='flex-1 max-w-96 mx-auto h-5 bg-brand-stroke-outermost relative rounded-md flex items-center justify-center px-2.5 text-xs text-brand-component-text-gray font-medium'>
        <div className='flex items-center gap-1 min-w-0 w-full justify-center'>
          <Lock2 className='size-3 text-brand-component-text-gray shrink-0' />
          {isLoading ? (
            <Skeleton className='h-3 w-32 bg-white/20' />
          ) : (
            <span className='truncate text-white'>
              https://{domain || DEFAULT_DOMAIN}/
            </span>
          )}
        </div>
        <RotateCw className='size-3 text-brand-icon-gray shrink-0 cursor-pointer absolute right-2' />
      </div>
      <div className='flex items-center gap-3 shrink-0 text-brand-component-text-gray'>
        <Share className='size-3.5' />
        <Plus className='size-3.5' />
        <Copy className='size-3.5' />
      </div>
    </div>
  );
};
