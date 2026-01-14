import { Search } from 'lucide-react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useDebounce } from '@/hooks/useDebounce';

import { InputWithIcon } from '@/components/ui/input';
import DeviceModelList from '@/containers/devices/components/add-device-modal/components/add-device-manual/components/device-model-list';
import { useDeviceModel } from '@/containers/devices/components/add-device-modal/components/add-device-manual/hooks/useDeviceModel';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';

import NodataSVG from '/public/images/nodata.svg';

const AddDeviceManual = () => {
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search);
  const { data: deviceResults, isLoading } = useDeviceModel(searchDebounced);

  const { selectedBrand, setSelectedBrand } = useAddDeviceModalStore(
    useShallow((state) => ({
      selectedBrand: state.selectedBrand,
      setSelectedBrand: state.setSelectedBrand,
    })),
  );

  const deviceModels = deviceResults?.results || [];

  const onSelectBrand = useCallback(
    (id: string) => {
      setSelectedBrand(selectedBrand === id ? undefined : id);
    },
    [setSelectedBrand, selectedBrand],
  );

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <InputWithIcon
          placeholder='Search or add brand'
          prefixCpn={<Search size={16} />}
          className='w-full'
          wrapperClass='w-full'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!isLoading && deviceModels.length === 0 && (
          <div className='h-32 w-full flex items-center justify-center'>
            <div className='flex flex-col space-y-2'>
              <Image
                src={NodataSVG}
                alt='nodata'
                className='h-full w-full max-w-44 object-contain flex justify-center items-center'
              />
              <p className='mt-3 text-wrap text-center text-base font-normal text-brand-component-text-dark'>
                No results found
              </p>
            </div>
          </div>
        )}

        <div className='grid grid-cols-4 gap-2 overflow-y-auto'>
          <DeviceModelList
            deviceModels={deviceModels}
            isLoading={isLoading}
            selectedBrand={selectedBrand}
            onSelectBrand={onSelectBrand}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(AddDeviceManual);
