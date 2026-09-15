'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { FloppyDisk, Trash2Outline } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface Props {
  onDiscard: () => void;
  onSave: () => void;
  isSaving?: boolean;
  className?: string;
}

export const MapEditActions = ({
  onDiscard,
  onSave,
  isSaving,
  className,
}: Props) => {
  const t = useTranslations('monitoring');

  return (
    <div className={cn('flex shrink-0 items-center gap-x-1.5', className)}>
      <Button
        type='button'
        onClick={onDiscard}
        disabled={isSaving}
        prefixCpn={<Trash2Outline className='size-4 shrink-0' />}
        variant='outline'
        size='sm'
        className='shrink-0 border-brand-component-stroke-dark-soft bg-brand-component-fill-light font-semibold leading-[18px] text-brand-component-text-dark shadow-sm transition-colors hover:bg-brand-component-fill-dark-soft'
      >
        {t('discard')}
      </Button>
      <Button
        type='button'
        onClick={onSave}
        loading={isSaving}
        prefixCpn={<FloppyDisk className='size-4 shrink-0' />}
        size='sm'
        className='shrink-0 bg-brand-component-fill-dark font-semibold leading-[18px] text-brand-component-text-light shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors hover:bg-brand-component-hover-dark dark:bg-brand-component-fill-dark dark:text-brand-component-text-light hover:dark:bg-brand-component-hover-dark'
      >
        {t('save_changes')}
      </Button>
    </div>
  );
};
