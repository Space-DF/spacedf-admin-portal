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
  onSave: (id: string) => void;
  isLoading?: boolean;
  selectedEditDeviceId?: string;
  setSelectedEditDeviceId: (id?: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DialogSaveDevice: React.FC<Props> = ({
  onSave,
  isLoading,
  selectedEditDeviceId,
  setSelectedEditDeviceId,
  isOpen,
  setIsOpen,
}) => {
  const t = useTranslations('organization');

  const handleSave = async () => {
    if (!selectedEditDeviceId) return;
    try {
      await onSave(selectedEditDeviceId);
      setSelectedEditDeviceId(undefined);
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-center'>
            {t('save')}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-center'>
            {t('confirm_save_changes')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className='grid grid-cols-2 gap-x-4 w-full'>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button onClick={handleSave} loading={isLoading}>
              {t('confirm')}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DialogSaveDevice;
