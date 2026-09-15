'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

interface Props {
  isRealData: boolean;
  className?: string;
}

export const DataModeBadge = ({ isRealData, className }: Props) => {
  const t = useTranslations('common');

  return (
    <div
      className={cn(
        'flex h-8 shrink-0 items-center gap-2 rounded-[10px] border border-brand-component-stroke-dark-soft bg-brand-component-fill-light px-3 py-2 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div
        className={cn(
          'size-[13px] shrink-0 rounded-full',
          isRealData ? 'bg-brand-icon-positive' : 'bg-brand-icon-warning',
        )}
      />
      <span className='whitespace-nowrap text-xs font-semibold leading-[18px] text-brand-component-text-dark'>
        {isRealData ? t('real_data') : t('preview_data')}
      </span>
    </div>
  );
};
