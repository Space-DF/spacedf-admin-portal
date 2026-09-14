'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import OrganizationHeader from '@/components/layouts/organization-header';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeviceInformation from '@/containers/devices/containers/device-detail/components/device-information';
import EventsTab from '@/containers/devices/containers/device-detail/components/events';
import GeneralTab from '@/containers/devices/containers/device-detail/components/general';

import { Device } from '@/types';

interface Props {
  deviceServerData: Device;
}

export default function DeviceDetail({ deviceServerData }: Props) {
  const [activeTab, setActiveTab] = useState<string>('informations');
  const t = useTranslations('device-detail');
  const tOrganization = useTranslations('organization');
  const isDeviceWaterLevel =
    deviceServerData.device_profile.key_feature === 'water_depth';
  const { slugName } = useParams<{ slugName: string }>();
  const deviceId = deviceServerData.id;

  const tabs = useMemo(
    () => [
      {
        label: t('informations'),
        value: 'informations',
        content: (
          <GeneralTab
            deviceId={deviceId}
            isDeviceWaterLevel={isDeviceWaterLevel}
          />
        ),
      },
      {
        label: t('events_logs'),
        value: 'events',
        content: <EventsTab deviceId={deviceId} />,
      },
    ],
    [t, isDeviceWaterLevel, deviceId],
  );

  return (
    <div className='w-full space-y-6'>
      <OrganizationHeader
        title={t('device_details')}
        items={[
          {
            label: tOrganization('device_hub'),
            href: `/organizations/${slugName}/devices`,
          },
        ]}
      />

      <Card className='mx-auto space-y-5 rounded-2xl border-none p-6 shadow-none max-w-[900px]'>
        <DeviceInformation
          deviceId={deviceId}
          deviceServerData={deviceServerData}
        />

        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v)}>
          <TabsList className='h-9 w-full rounded-lg bg-brand-component-fill-dark-soft p-1'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='h-full flex-1 rounded-md text-sm font-medium text-brand-component-text-gray data-[state=active]:bg-brand-component-fill-light data-[state=active]:font-semibold data-[state=active]:text-brand-component-text-dark data-[state=active]:shadow-none'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className='mt-5'>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}
