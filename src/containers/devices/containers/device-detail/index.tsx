'use client';

import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralTab from '@/containers/devices/containers/device-detail/components/general';
import RemoveDeviceTab from '@/containers/devices/containers/device-detail/components/remove-device';
import { useDevice } from '@/containers/devices/containers/device-detail/hooks/useDevice';

import { useRouter } from '@/i18n/routing';

import { Device } from '@/types';

const TABS = [
  {
    label: 'General',
    value: 'general',
  },
  // {
  //   label: 'Events',
  //   value: 'events',
  // },
  {
    label: 'Remove',
    value: 'remove',
  },
];

interface Props {
  deviceServerData: Device;
}

export default function DeviceDetail({ deviceServerData }: Props) {
  const [activeTab, setActiveTab] = useState<string>('general');
  const t = useTranslations('device-detail');

  const router = useRouter();

  const { slugName } = useParams<{ slugName: string }>();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.replace(`/organizations/${slugName}/devices`);
    }
  };

  const tabContents = useMemo(() => {
    return {
      general: <GeneralTab />,
      // events: <EventsTab />,
      remove: <RemoveDeviceTab />,
    };
  }, []);
  const { data: device, isLoading } = useDevice(deviceServerData);

  const isActive = device?.status === 'active';

  return (
    <div className='w-full space-y-6'>
      <div className='flex space-x-2 items-center h-8 py-3'>
        <ChevronLeft
          className='text-brand-icon-gray size-6 cursor-pointer'
          onClick={handleGoBack}
        />
        <span className='leading-6 text-[16px] font-bold'>
          {t('device_detail')}
        </span>
      </div>
      <div className='flex items-center gap-4'>
        {isLoading ? (
          <Skeleton className='w-12 h-20 rounded-sm' />
        ) : (
          <Image
            src={device?.device_model?.image_url || '/images/rak-sticker.webp'}
            alt={device?.device_model.id || ''}
            width={50}
            height={80}
            className='object-cover'
          />
        )}
        <div className='flex-1 flex-col justify-between'>
          {isLoading ? (
            <Skeleton className='w-20 h-2' />
          ) : (
            <span className='text-brand-component-text-gray text-xs font-semibold'>
              {device?.device_model?.name}
            </span>
          )}

          <div className='flex space-x-2 items-center'>
            {isLoading ? (
              <Skeleton className='w-20 h-3' />
            ) : (
              <p className='text-brand-component-text-dark text-[16px] font-bold'>
                {device?.device_model.device_type}
              </p>
            )}
            {isActive ? (
              <div className='bg-brand-component-fill-positive-soft border-brand-component-stroke-positive-soft text-brand-component-text-positive px-2 py-1 text-xs font-semibold rounded border'>
                Active
              </div>
            ) : (
              <div className='bg-brand-component-fill-secondary-soft border-brand-component-stroke-secondary-soft text-brand-component-text-secondary px-2 py-1 text-xs font-semibold rounded border'>
                Inventory
              </div>
            )}
          </div>
          <span className='text-brand-component-text-gray text-xs font-semibold'>
            Universal LoRa node with multiple sensors and inputs{' '}
          </span>
        </div>
      </div>

      <Card className='p-4 border-none shadow-none'>
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v)}>
          <TabsList className='bg-background rounded-none p-0'>
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='bg-background data-[state=active]:border-brand-component-stroke-dark data-[state=active]:font-semibold data-[state=active]:text-brand-component-text-dark h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none text-brand-component-text-gray text-base font-medium'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Separator />
          {TABS.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className='space-y-8 p-6 px-4 mt-0'
            >
              {tabContents[tab.value as keyof typeof tabContents]}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
