'use client';

import { useTranslations } from 'next-intl';

import { Info } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DialogDiscard = ({ open, onOpenChange, onConfirm }: Props) => {
  const t = useTranslations('white-label');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md gap-0'>
        <div className='flex size-10 items-center justify-center rounded-lg bg-brand-component-fill-dark-soft'>
          <Info className='size-5 text-brand-icon-dark' />
        </div>

        <DialogTitle className='mt-4 text-[16px] font-semibold text-brand-component-text-dark'>
          {t('confirm_discard_title')}
        </DialogTitle>

        <DialogDescription className='mt-4 text-body text-brand-component-text-gray'>
          {t('confirm_discard_description')}
        </DialogDescription>

        <div className='mt-10 flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={onConfirm}
            className='h-9 rounded-lg border-brand-component-stroke-dark-soft px-4 text-sm font-semibold text-brand-component-text-dark'
          >
            {t('discard_changes')}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className='h-9 rounded-lg px-4 text-sm font-semibold'
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
