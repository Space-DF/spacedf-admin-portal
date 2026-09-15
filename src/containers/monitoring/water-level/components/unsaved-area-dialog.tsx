'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Info } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useWaterLevelSensors } from '@/containers/monitoring/water-level/hooks/use-water-level-sensors';

const SECONDARY_BUTTON_CLASS =
  'h-9 shrink-0 border-brand-component-stroke-dark-soft bg-brand-component-fill-light font-semibold shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-brand-component-fill-dark-soft';

export const UnsavedAreaDialog = () => {
  const t = useTranslations('monitoring');

  const {
    hasHeldSwitch,
    keepEditing,
    discardAndSwitch,
    saveAndSwitch,
    isSaving,
  } = useWaterLevelSensors();

  return (
    <AlertDialog
      open={hasHeldSwitch}
      onOpenChange={(open) => !open && keepEditing()}
    >
      <AlertDialogContent className='gap-0 overflow-hidden rounded-2xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-0 shadow-[0px_16px_18px_0px_rgba(0,0,0,0.06)] sm:max-w-[400px] sm:rounded-2xl'>
        <AlertDialogHeader className='gap-y-4 space-y-0 p-6 text-left sm:text-left'>
          <button
            type='button'
            aria-label={t('close')}
            disabled={isSaving}
            onClick={keepEditing}
            className='absolute right-2 top-2 flex size-8 items-center justify-center rounded-[10px] text-brand-component-text-dark transition-colors hover:bg-brand-component-fill-dark-soft disabled:pointer-events-none disabled:opacity-50'
          >
            <X className='size-4 shrink-0' />
          </button>

          <span className='flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-component-fill-dark-soft'>
            <Info className='size-8 text-brand-component-text-dark' />
          </span>

          <AlertDialogTitle className='text-[16px] font-semibold leading-6 text-brand-component-text-dark'>
            {t('unsaved_area_title')}
          </AlertDialogTitle>

          <AlertDialogDescription className='text-sm font-normal leading-5 text-brand-component-text-gray'>
            {t('unsaved_area_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className='flex-row items-center justify-between gap-x-2 p-4 sm:justify-between sm:space-x-0'>
          <Button
            type='button'
            variant='outline'
            disabled={isSaving}
            onClick={discardAndSwitch}
            className={cn(
              SECONDARY_BUTTON_CLASS,
              'text-brand-component-text-gray',
            )}
          >
            {t('discard')}
          </Button>

          <div className='flex items-center gap-x-2'>
            <Button
              type='button'
              variant='outline'
              disabled={isSaving}
              onClick={keepEditing}
              className={cn(
                SECONDARY_BUTTON_CLASS,
                'text-brand-component-text-dark',
              )}
            >
              {t('cancel')}
            </Button>
            <Button
              type='button'
              loading={isSaving}
              onClick={saveAndSwitch}
              className='h-9 shrink-0 bg-brand-component-fill-dark font-semibold text-brand-component-text-light shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors hover:bg-brand-component-hover-dark dark:bg-brand-component-fill-dark dark:text-brand-component-text-light hover:dark:bg-brand-component-hover-dark'
            >
              {t('save_changes')}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
