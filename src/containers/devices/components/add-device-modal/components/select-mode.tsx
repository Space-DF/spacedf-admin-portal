import { useTranslations } from 'next-intl';
import React, { memo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { AddDeviceAuto, AddDeviceManual } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';

enum AddDeviceMode {
  Auto = 'auto',
  Manual = 'manual',
}

interface BrandItemProps {
  image: React.ReactNode;
  title: string;
  description: string;
  value: AddDeviceMode;
  currentValue: AddDeviceMode;
  onClick: () => void;
  isRecommended?: boolean;
  isComingSoon?: boolean;
}

const BrandItem = ({
  image,
  title,
  description,
  value,
  currentValue,
  onClick,
  isRecommended,
  isComingSoon,
}: BrandItemProps) => {
  const handleSelectMode = () => {
    if (isComingSoon) return;
    onClick();
  };

  const t = useTranslations('organization');
  return (
    <div
      className={cn(
        'rounded-lg p-0.5 relative bg-gradient-to-r duration-150 transition-transform',
        {
          'from-brand-very-light-blue to-[#CCBFFF] scale-105':
            value === currentValue,
          'hover:from-brand-very-light-blue hover:to-[#CCBFFF]':
            value !== currentValue && !isComingSoon,
        },
      )}
      onClick={handleSelectMode}
    >
      <button
        className={cn(
          'px-4 py-8 bg-brand-component-fill-gray-soft border-2 border-transparent cursor-pointer rounded-lg flex-1 h-full w-full relative',
          isComingSoon && 'cursor-not-allowed',
        )}
      >
        {isRecommended && (
          <Badge className='top-1 right-1 absolute rounded'>
            {t('recommended')}
          </Badge>
        )}
        {isComingSoon && (
          <div className='text-[16px] text-brand-component-text-light font-semibold absolute rounded-lg inset-0 bg-[#000000]/40 backdrop-blur-xl flex items-center justify-center'>
            {t('coming_soon')}...
          </div>
        )}

        <div className='space-y-2 flex flex-col justify-center items-center'>
          {image}
          <p className='font-semibold text-[16px] text-brand-heading-200'>
            {title}
          </p>
          <p className='text-brand-text-gray'>{description}</p>
        </div>
      </button>
    </div>
  );
};

const SelectMode = () => {
  const { setSelectedMode, selectedMode } = useAddDeviceModalStore(
    useShallow((state) => ({
      setSelectedMode: state.setSelectedMode,
      selectedMode: state.selectedMode,
    })),
  );

  return (
    <div className='grid grid-cols-2 gap-4 w-[600px]'>
      <BrandItem
        image={<AddDeviceManual />}
        title='Manual'
        value={AddDeviceMode.Manual}
        currentValue={selectedMode}
        description='Enter your device info by yourself'
        onClick={() => setSelectedMode(AddDeviceMode.Manual)}
      />
      <BrandItem
        image={<AddDeviceAuto />}
        title='Auto detect'
        value={AddDeviceMode.Auto}
        currentValue={selectedMode}
        description='Take a picture of the device and the system will automatically detect it.'
        onClick={() => setSelectedMode(AddDeviceMode.Auto)}
        isRecommended
        isComingSoon
      />
    </div>
  );
};

export default memo(SelectMode);
