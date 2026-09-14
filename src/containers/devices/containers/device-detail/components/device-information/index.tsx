import dayjs from 'dayjs';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ReactNode } from 'react';

import { Calendar, Devices } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useDevice } from '@/containers/devices/containers/device-detail/hooks/useDevice';

import { Device } from '@/types';

interface FieldProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
}

const Field = ({ icon, label, children, className }: FieldProps) => (
  <div className={className}>
    <div className='flex items-center gap-1 text-brand-component-text-dark'>
      {icon}
      <span className='text-sm font-medium'>{label}</span>
    </div>
    <div className='mt-2 text-sm'>{children}</div>
  </div>
);

interface Props {
  deviceId: string;
  deviceServerData?: Device;
}

const DeviceInformation = ({ deviceId, deviceServerData }: Props) => {
  const t = useTranslations('device-detail');
  const { data: device, isLoading } = useDevice(deviceId, deviceServerData);

  const isActive = device?.status === 'active';

  return (
    <div className='flex gap-4 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-4'>
      <div className='flex size-[114px] shrink-0 items-center justify-center rounded-lg border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-2'>
        {isLoading ? (
          <Skeleton className='h-full w-[62px] rounded-sm' />
        ) : (
          <Image
            src={device?.device_profile?.logo || '/images/rak-sticker.webp'}
            alt={device?.device_model?.id || ''}
            width={186}
            height={294}
            quality={100}
            className='h-full w-auto object-contain'
          />
        )}
      </div>
      <div className='flex flex-1 flex-col justify-between gap-2'>
        <div className='flex gap-2'>
          <Field
            className='w-[200px] shrink-0'
            icon={<Devices className='size-5' />}
            label={t('device_model')}
          >
            {isLoading ? (
              <Skeleton className='h-4 w-32' />
            ) : (
              <span className='text-brand-component-text-gray'>
                {device?.device_profile?.device_type}
              </span>
            )}
          </Field>
          <Field
            className='min-w-0 flex-1'
            icon={<Devices className='size-5' />}
            label={t('device_id')}
          >
            {isLoading ? (
              <Skeleton className='h-4 w-56' />
            ) : (
              <span className='block truncate text-brand-component-text-gray'>
                {device?.id}
              </span>
            )}
          </Field>
        </div>
        <div className='flex gap-2'>
          <Field
            className='w-[200px] shrink-0'
            icon={<Devices className='size-5' />}
            label={t('status')}
          >
            {isActive ? (
              <span className='inline-flex h-5 items-center rounded-md border border-brand-component-stroke-positive-soft bg-brand-component-fill-positive-soft px-2 text-xs font-semibold text-brand-component-text-positive'>
                {t('active')}
              </span>
            ) : (
              <span className='inline-flex h-5 items-center rounded-md border border-brand-component-stroke-secondary-soft bg-brand-component-fill-secondary-soft px-2 text-xs font-semibold text-brand-component-text-secondary'>
                {t('inventory')}
              </span>
            )}
          </Field>
          <Field
            className='min-w-0 flex-1'
            icon={<Calendar className='size-5' />}
            label={t('created_date')}
          >
            {isLoading ? (
              <Skeleton className='h-4 w-40' />
            ) : (
              <span className='text-brand-component-text-gray'>
                {dayjs(device?.created_at).format('MMM D, YYYY - HH:mm:ss')}
              </span>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
};

export default DeviceInformation;
