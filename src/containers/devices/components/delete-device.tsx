import { useTranslations } from 'next-intl';
import React from 'react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface Props {
  onRemove: () => Promise<void>;
  isDeleting?: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setSelectedDeleteDeviceIndex: (index?: number) => void;
}

const DialogDeleteDevice: React.FC<Props> = ({
  onRemove,
  isDeleting,
  isOpen,
  setIsOpen,
  setSelectedDeleteDeviceIndex,
}) => {
  const handleRemove = async () => {
    try {
      await onRemove();
    } finally {
      setIsOpen(false);
    }
  };
  const t = useTranslations('organization');

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectedDeleteDeviceIndex(undefined);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center'>
            {t('remove')}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center'>
            {t('confirm_remove_device')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className='grid grid-cols-2 gap-x-4 w-full'>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button
              variant='destructive'
              className='bg-brand-component-fill-negative border-brand-component-hover-accent border-2'
              onClick={handleRemove}
              loading={isDeleting}
            >
              {t('remove')}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogDeleteDevice;
