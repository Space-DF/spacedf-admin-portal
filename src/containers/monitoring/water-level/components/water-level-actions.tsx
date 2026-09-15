'use client';

import { Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

interface Props {
  onDiscard: () => void;
  onSave: () => void;
  isDirty?: boolean;
  isSaving?: boolean;
  className?: string;
}

export const WaterLevelActions = ({
  onDiscard,
  onSave,
  isDirty,
  isSaving = false,
  className,
}: Props) => {
  const t = useTranslations('monitoring');

  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-x-2 border-t border-dashed border-brand-component-stroke-dark-soft p-4',
        className,
      )}
    >
      <Button
        type='button'
        onClick={onDiscard}
        disabled={isSaving || !isDirty}
        prefixCpn={<X className='size-4 shrink-0' />}
        variant='outline'
        size='sm'
        className='shrink-0 border-brand-component-stroke-dark-soft bg-brand-component-fill-light font-semibold text-brand-component-text-dark shadow-sm transition-all hover:bg-brand-component-fill-dark-soft'
      >
        {t('discard')}
      </Button>
      <Button
        type='button'
        onClick={onSave}
        disabled={isSaving || !isDirty}
        loading={isSaving}
        prefixCpn={<Save className='size-4 shrink-0' />}
        size='sm'
        className='min-w-0 flex-1 font-semibold shadow-sm transition-all'
      >
        {t('save_settings')}
      </Button>
    </div>
  );
};
