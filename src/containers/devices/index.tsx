'use client';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import { useDebounce } from '@/hooks';

import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from '@/components/ui/motion-tabs';
import AddDeviceModal from '@/containers/devices/components/add-device-modal';
import TableDevice from '@/containers/devices/components/table-device';
import { useDevices } from '@/containers/devices/hooks/useDevices';
import { useDeviceTabStore } from '@/containers/devices/stores/useDeviceTab';
import { getDeviceData } from '@/containers/devices/utils';

import { TableDevice as TableDeviceType } from '@/types';

import deviceIcon from '/public/images/device.svg';
import inventoryIcon from '/public/images/inventory.svg';

const DeviceOrganization = () => {
  const t = useTranslations('organization');

  const { activeTab, setActiveTab } = useDeviceTabStore();

  const [deviceActiveName, setDeviceActiveName] = useState('');
  const [pageDeviceActiveIndex, setPageDeviceActiveIndex] = useState(0);
  const deviceActiveNameDebounced = useDebounce(deviceActiveName);
  const deviceActiveCountRef = useRef(0);
  const {
    data: deviceActive,
    mutate: mutateDeviceActive,
    isLoading: isLoadingDeviceActive,
  } = useDevices(deviceActiveNameDebounced, 'active', pageDeviceActiveIndex);
  deviceActiveCountRef.current = deviceActive
    ? deviceActive.count
    : deviceActiveCountRef.current || 0;

  const [deviceInventoryName, setDeviceInventoryName] = useState('');
  const [pageDeviceInventoryIndex, setPageDeviceInventoryIndex] = useState(0);
  const deviceInventoryNameDebounced = useDebounce(deviceInventoryName);
  const deviceInventoryCountRef = useRef(0);
  const {
    data: deviceInventory,
    mutate: mutateDeviceInventory,
    isLoading: isLoadingDeviceInventory,
  } = useDevices(
    deviceInventoryNameDebounced,
    'in_inventory',
    pageDeviceInventoryIndex,
  );
  deviceInventoryCountRef.current = deviceInventory
    ? deviceInventory.count
    : deviceInventoryCountRef.current || 0;

  const handleNameChange = (name: string) => {
    if (isDevicesTab) {
      setDeviceActiveName(name);
    } else {
      setDeviceInventoryName(name);
    }
  };

  const deviceActiveData: TableDeviceType[] = useMemo(
    () => getDeviceData(deviceActive, isLoadingDeviceActive),
    [deviceActive, isLoadingDeviceActive],
  );
  const deviceInventoryData: TableDeviceType[] = useMemo(
    () => getDeviceData(deviceInventory, isLoadingDeviceInventory),
    [deviceInventory, isLoadingDeviceInventory],
  );

  const isDevicesTab = activeTab === 'active';

  const handlePrevPage = () => {
    if (isDevicesTab) {
      setPageDeviceActiveIndex((prev) => prev - 1);
    } else {
      setPageDeviceInventoryIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (isDevicesTab) {
      setPageDeviceActiveIndex((prev) => prev + 1);
    } else {
      setPageDeviceInventoryIndex((prev) => prev + 1);
    }
  };

  const deviceActiveQuantity = deviceActiveCountRef.current;

  const deviceInventoryQuantity = deviceInventoryCountRef.current;

  const searchValue = isDevicesTab ? deviceActiveName : deviceInventoryName;

  return (
    <>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <p className='font-bold text-xl'>{t('device_hub')}</p>
          <AddDeviceModal>
            <Button>{t('add_device')}</Button>
          </AddDeviceModal>
        </div>
        <div className='bg-brand-background-fill-outermost p-4 rounded-2xl space-y-4'>
          <Tabs
            value={activeTab}
            onValueChange={(value: 'active' | 'in_inventory') =>
              setActiveTab(value)
            }
          >
            <div className='flex justify-between items-center mb-4'>
              <TabsList className='p-1'>
                <TabsTrigger value='in_inventory'>
                  <div className='flex items-center space-x-2 px-4 py-2'>
                    <Image
                      src={inventoryIcon}
                      alt='inventory'
                      width={20}
                      height={20}
                    />
                    <span>{t('inventory')}</span>
                    {deviceInventoryQuantity > 0 ? (
                      <div className='text-white font-semibold p-1 py-px bg-brand-component-fill-secondary rounded-[2px]'>
                        {deviceInventoryQuantity > 9
                          ? deviceInventoryQuantity
                          : `0${deviceInventoryQuantity}`}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </TabsTrigger>
                <TabsTrigger value='active'>
                  <div className='flex items-center space-x-2 px-4 py-2'>
                    <Image
                      src={deviceIcon}
                      alt='device'
                      width={20}
                      height={20}
                    />
                    <span>{t('devices')}</span>{' '}
                    {deviceActiveQuantity > 0 ? (
                      <div className='text-white font-semibold p-1 py-px bg-brand-component-fill-secondary rounded-[2px]'>
                        {deviceActiveQuantity > 9
                          ? deviceActiveQuantity
                          : `0${deviceActiveQuantity}`}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
              <InputWithIcon
                prefixCpn={<Search size={16} />}
                placeholder={t('search')}
                value={searchValue}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <TabsContents>
              <TabsContent value='in_inventory'>
                <TableDevice
                  devices={deviceInventoryData}
                  isLoading={isLoadingDeviceInventory}
                  pageIndex={pageDeviceInventoryIndex}
                  count={deviceInventoryQuantity}
                  mutate={mutateDeviceInventory}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                />
              </TabsContent>
              <TabsContent value='active'>
                <TableDevice
                  devices={deviceActiveData}
                  isLoading={isLoadingDeviceActive}
                  pageIndex={pageDeviceActiveIndex}
                  count={deviceActiveQuantity}
                  mutate={mutateDeviceActive}
                  onNextPage={handleNextPage}
                  onPrevPage={handlePrevPage}
                  activeTab={isDevicesTab}
                />
              </TabsContent>
            </TabsContents>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DeviceOrganization;
