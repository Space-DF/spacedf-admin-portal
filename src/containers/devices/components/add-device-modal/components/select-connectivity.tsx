import { useTranslations } from 'next-intl';
import React, { memo, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { ApiDevice, LorawanDevice } from '@/components/icons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { ConnectivityType } from '@/containers/devices/components/add-device-modal/types';

interface ConnectivityOption {
  value: ConnectivityType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SelectConnectivity = () => {
  const t = useTranslations('organization');
  const { connectivityType, setConnectivityType } = useAddDeviceModalStore(
    useShallow((state) => ({
      connectivityType: state.connectivityType,
      setConnectivityType: state.setConnectivityType,
    })),
  );

  const options: ConnectivityOption[] = useMemo(
    () => [
      {
        value: ConnectivityType.Lorawan,
        title: 'LoRaWAN',
        description: t('lorawan_connectivity_description'),
        icon: <LorawanDevice />,
      },
      {
        value: ConnectivityType.Api,
        title: 'API',
        description: t('api_connectivity_description'),
        icon: <ApiDevice />,
      },
    ],
    [t],
  );

  return (
    <RadioGroup
      value={connectivityType}
      onValueChange={(value) => setConnectivityType(value as ConnectivityType)}
      className='gap-2 w-[600px]'
    >
      {options.map(({ value, title, description, icon }) => (
        <label
          key={value}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer duration-150',
            'bg-brand-background-fill-outermost border-brand-component-stroke-dark-soft hover:border-brand-component-stroke-dark',
            connectivityType === value &&
              'bg-brand-background-fill-surface border-brand-component-stroke-dark',
          )}
        >
          <RadioGroupItem
            value={value}
            className='size-5 shrink-0'
            circleClassName='size-4'
          />
          <div className='flex flex-1 items-center gap-3 min-w-0'>
            <div className='flex size-12 items-center justify-center shrink-0 text-brand-component-text-dark'>
              {icon}
            </div>
            <div className='flex flex-1 flex-col gap-1 min-w-0'>
              <p className='font-semibold text-[16px] leading-6 text-brand-component-text-dark'>
                {title}
              </p>
              <p className='text-xs leading-[18px] text-brand-component-text-gray'>
                {description}
              </p>
            </div>
          </div>
        </label>
      ))}
    </RadioGroup>
  );
};

export default memo(SelectConnectivity);
