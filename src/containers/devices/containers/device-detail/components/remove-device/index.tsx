import { TriangleAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useSWRConfig } from 'swr';

import { Button } from '@/components/ui/button';
import { useDeleteDevice } from '@/containers/devices/hooks/useDeleteDevice';

import { useRouter } from '@/i18n/routing';

const RemoveDeviceTab = () => {
  const { trigger: deleteDevice, isMutating: isDeleting } = useDeleteDevice();
  const { deviceId, slugName } = useParams<{
    deviceId: string;
    slugName: string;
  }>();
  const t = useTranslations('device-detail');

  const { mutate } = useSWRConfig();

  const router = useRouter();
  const handleDeleteDevice = async () => {
    await deleteDevice({ id: deviceId });
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('/api/devices'),
      undefined,
      { revalidate: true },
    );
    router.push(`/organizations/${slugName}/devices`);
  };
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-1 rounded bg-brand-semantic-accent-light p-2 text-xs font-semibold text-brand-semantic-accent dark:bg-brand-semantic-accent-dark-300 dark:text-brand-semantic-accent-300'>
        <TriangleAlert size={16} />
        {t('warning_this_is_a_potentially_destructive_action')}
      </div>
      <Button
        variant='destructiveOutline'
        size='sm'
        loading={isDeleting}
        onClick={handleDeleteDevice}
      >
        {t('remove_device')}
      </Button>
    </div>
  );
};

export default RemoveDeviceTab;
