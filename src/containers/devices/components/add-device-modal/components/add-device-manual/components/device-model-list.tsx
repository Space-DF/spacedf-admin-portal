import { memo } from 'react';

import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';

import { capitalizeFirstLetter } from '@/utils/capitalizeFirstLetter';

import { DeviceModel } from '@/types';

interface Props {
  deviceModels: DeviceModel[];
  isLoading?: boolean;
  selectedBrand?: string;
  onSelectBrand: (id: string) => void;
}

const DeviceModelList: React.FC<Props> = ({
  deviceModels,
  isLoading,
  selectedBrand,
  onSelectBrand,
}) => {
  if (isLoading) {
    return Array.from({ length: 4 }).map((_, index) => (
      <button
        className='border border-brand-component-stroke-dark-soft rounded-md duration-150 h-20'
        key={index}
      >
        <div className='flex flex-col justify-between h-full py-2 items-center'>
          <span className='text-brand-component-text-dark text-center flex justify-center text-xs font-medium w-40'>
            <Skeleton className='w-20 h-3' />
          </span>
          <Skeleton className='w-32 h-3' />
        </div>
      </button>
    ));
  }
  return deviceModels.map((brand) => (
    <button
      className={cn(
        'border border-brand-component-stroke-dark-soft rounded-md hover:border-brand-component-stroke-dark duration-150 h-20',
        selectedBrand === brand.id && 'border-brand-component-stroke-dark',
      )}
      onClick={() => onSelectBrand(brand.id)}
      key={brand.id}
    >
      <div className='flex flex-col justify-between h-full py-2 items-center'>
        <span className='text-brand-component-text-dark text-xs font-medium w-40'>
          {brand.name}
        </span>
        <div className='text-brand-component-text-info text-xs font-semibold py-px px-2 bg-[#CCE9FF] rounded-sm max-w-28'>
          {capitalizeFirstLetter(brand.device_type)}
        </div>
      </div>
    </button>
  ));
};

export default memo(DeviceModelList);
