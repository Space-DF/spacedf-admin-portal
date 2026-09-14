import { Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import DialogDeleteDevice from '@/containers/devices/components/delete-device';
import { useDeleteDevice } from '@/containers/devices/hooks/useDeleteDevice';

import { useRouter } from '@/i18n/routing';

interface Props {
  deviceId: string;
}

const RemoveDeviceTab = ({ deviceId }: Props) => {
  const { mutateAsync: deleteDevice, isPending: isDeleting } =
    useDeleteDevice();
  const { slugName } = useParams<{ slugName: string }>();
  const t = useTranslations('device-detail');
  const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);

  const router = useRouter();
  const handleDeleteDevice = async () => {
    await deleteDevice({ id: deviceId });
    router.push(`/${slugName}/devices`);
  };

  return (
    <div className='flex items-center gap-4 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-4'>
      <div className='min-w-0 flex-1 space-y-1'>
        <p className='text-sm font-semibold text-brand-component-text-negative-dark'>
          {t('delete_this_device')}
        </p>
        <p className='text-sm text-brand-component-text-gray'>
          {t('delete_device_description')}
        </p>
      </div>
      <Button
        variant='destructiveOutline'
        size='sm'
        className='flex items-center gap-2'
        loading={isDeleting}
        onClick={() => setIsOpenConfirmDelete(true)}
        prefixCpn={<Trash2 className='size-4' />}
      >
        {t('delete_device')}
      </Button>

      <DialogDeleteDevice
        onRemove={handleDeleteDevice}
        isDeleting={isDeleting}
        isOpen={isOpenConfirmDelete}
        setIsOpen={setIsOpenConfirmDelete}
      />
    </div>
  );
};

export default RemoveDeviceTab;
