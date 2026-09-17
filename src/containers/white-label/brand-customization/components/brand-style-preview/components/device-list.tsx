import { Ellipsis, ListFilter, Map, PlusIcon, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import ImageWithBlur from '@/components/ui/image-blur';
import { InputWithIcon } from '@/components/ui/input';

import DeviceIcon from '/public/images/device-icon.webp';

const MOCK_DEVICES = [
  {
    id: 'device-1',
    name: 'DMZ 01 -1511-M01',
    logo: null,
    locationName: 'New York, USA',
  },
  {
    id: 'device-2',
    name: 'Weather Station OS-2',
    logo: null,
    locationName: 'London, UK',
  },
  {
    id: 'device-3',
    name: 'Smart Thermostat',
    logo: null,
    locationName: 'Paris, France',
  },
  {
    id: 'device-4',
    name: 'Motion Sensor Hallway',
    logo: null,
    locationName: 'N/A',
  },
  {
    id: 'device-5',
    name: 'Industrial Gateway G1',
    logo: null,
    locationName: 'Tokyo, Japan',
  },
  {
    id: 'device-6',
    name: 'Water Leak Detector',
    logo: null,
    locationName: 'Unknown',
  },
];

export const DeviceList = () => {
  return (
    <div className='flex flex-col gap-4 overflow-hidden p-2 h-full'>
      <div className='flex items-center justify-between'>
        <span className='font-semibold text-[--text-color] text-base'>
          Device List
        </span>
        <div className='flex space-x-1 items-center'>
          <Button
            size='sm'
            className='rounded-[--button-border-radius] bg-[--primary-color] dark:bg-[--primary-color] hover:bg-[--primary-color] !text-[--primary-text-color]'
          >
            <PlusIcon size={16} />
            Add Device
          </Button>
          <div className='group h-max cursor-pointer rounded-sm p-1'>
            <PlusIcon
              size={18}
              className='rotate-45 duration-300 group-hover:-rotate-45 group-hover:scale-110 text-[--support-text-color]'
            />
          </div>
        </div>
      </div>
      <div className='flex items-center space-x-1'>
        <InputWithIcon
          prefixCpn={
            <Search size={18} className='text-[--support-text-color]' />
          }
          placeholder='Search device'
          wrapperClass='w-full border border-[--border-color] rounded-[--input-border-radius] transition-shadow focus-within:border-[--primary-color] focus-within:ring-2 focus-within:ring-offset-0 focus-within:ring-[color:color-mix(in_srgb,var(--primary-color)_40%,transparent)]'
          className='bg-[--input-color] rounded-[--input-border-radius] h-8 text-[--text-color] placeholder:text-[--support-text-color] focus-visible:ring-0 focus-visible:ring-offset-0'
        />
        <Button
          variant='outline'
          size='sm'
          className='rounded-[--button-border-radius] bg-[--secondary-color] border-[--border-color] text-[--secondary-text-color] flex items-center space-x-2'
        >
          <ListFilter size={16} />
          Filter
        </Button>
      </div>
      <div className='flex overflow-y-auto flex-1 scroll-smooth [&::-webkit-scrollbar-thumb]:border-r-4 [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]'>
        <div className='flex-1 transition-all duration-300'>
          <div className='grid grid-cols-2 gap-1 w-full pb-20'>
            {MOCK_DEVICES.map((device) => {
              const locationName = device.locationName;

              return (
                <div
                  key={device.id}
                  className={cn(
                    'cursor-pointer h-fit border border-[--border-color] p-2 rounded-[--card-border-radius] bg-[--device-card-color] text-[--text-color]',
                  )}
                >
                  <div className='space-y-2 mb-2'>
                    <div className='flex items-start justify-between'>
                      <div className='size-8'>
                        <ImageWithBlur
                          src={device.logo || DeviceIcon}
                          alt={device.name}
                          width={70}
                          height={70}
                        />
                      </div>
                      <Ellipsis
                        size={16}
                        className='text-[--support-text-color]'
                      />
                    </div>
                    <div className='text-xs font-medium'>
                      <span className='leading-[18px] line-clamp-1 text-[--text-color]'>
                        {device.name}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2 text-xs font-medium text-[--support-text-color]'>
                    <Map
                      size={16}
                      className='w-max text-[--support-text-color]'
                    />
                    <span
                      className='leading-[18px] line-clamp-1 flex-1 truncate text-[--support-text-color]'
                      title={locationName || undefined}
                    >
                      {locationName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
