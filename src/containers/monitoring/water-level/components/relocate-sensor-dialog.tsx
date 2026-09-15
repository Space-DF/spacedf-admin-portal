'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Warning } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const SECONDARY_BUTTON_CLASS =
  'h-9 shrink-0 border-brand-component-stroke-dark-soft bg-brand-component-fill-light font-semibold shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors hover:bg-brand-component-fill-dark-soft';

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RelocateSensorDialog = ({ open, onCancel, onConfirm }: Props) => {
  const t = useTranslations('monitoring');

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent className='gap-0 overflow-hidden rounded-2xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-0 shadow-[0px_16px_18px_0px_rgba(0,0,0,0.06)] sm:max-w-[400px] sm:rounded-2xl'>
        <AlertDialogHeader className='gap-y-4 space-y-0 p-6 text-left sm:text-left'>
          <button
            type='button'
            aria-label={t('close')}
            onClick={onCancel}
            className='absolute right-2 top-2 flex size-8 items-center justify-center rounded-[10px] text-brand-component-text-dark transition-colors hover:bg-brand-component-fill-dark-soft'
          >
            <X className='size-4 shrink-0' />
          </button>

          <span className='flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-component-fill-warning-soft'>
            <Warning className='size-8' />
          </span>

          <AlertDialogTitle className='text-[16px] font-semibold leading-6 text-brand-component-text-dark'>
            {t('relocate_outside_title')}
          </AlertDialogTitle>

          <AlertDialogDescription className='text-sm font-normal leading-5 text-brand-component-text-gray'>
            {t('relocate_outside_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className='flex-row items-center justify-end gap-x-2 p-4 sm:space-x-0'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            className={cn(
              SECONDARY_BUTTON_CLASS,
              'text-brand-component-text-dark',
            )}
          >
            {t('cancel')}
          </Button>
          <Button
            type='button'
            onClick={onConfirm}
            className='h-9 shrink-0 bg-brand-component-fill-dark font-semibold text-brand-component-text-light shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] transition-colors hover:bg-brand-component-hover-dark dark:bg-brand-component-fill-dark dark:text-brand-component-text-light hover:dark:bg-brand-component-hover-dark'
          >
            {t('move_sensor')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
