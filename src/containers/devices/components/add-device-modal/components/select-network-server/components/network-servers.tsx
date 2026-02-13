import Image from 'next/image';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { Skeleton } from '@/components/ui/skeleton';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';

import { NetworkServer } from '@/types/network-server';

interface Props {
  networkServers: NetworkServer[];
  isLoading?: boolean;
}

const NetworkServers: React.FC<Props> = ({ networkServers, isLoading }) => {
  const { setNetworkServer, networkServer } = useAddDeviceModalStore(
    useShallow((state) => ({
      setNetworkServer: state.setNetworkServer,
      networkServer: state.networkServer,
    })),
  );

  if (isLoading) {
    return Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className='flex items-center gap-4 p-4 border rounded-lg bg-white cursor-pointer'
      >
        <Skeleton className='w-10 h-10 rounded-md' />
        <div className='flex flex-col gap-1'>
          <Skeleton className='w-10 h-4' />
          <Skeleton className='w-20 h-3' />
        </div>
      </div>
    ));
  }

  return networkServers.map((server) => (
    <div
      key={server.id}
      className={cn(
        'flex flex-col items-center gap-2 p-4 border rounded-lg bg-white cursor-pointer hover:border-brand-component-stroke-dark duration-150',
        networkServer?.id === server.id && 'border-brand-component-stroke-dark',
      )}
      onClick={() => setNetworkServer(server)}
    >
      <span className='font-semibold'>{server.name}</span>
      <div className='h-10 flex items-center'>
        <Image
          src={server.logo}
          alt={server.name}
          width={40}
          height={40}
          className='rounded-md object-cover flex justify-center items-center'
        />
      </div>
    </div>
  ));
};

export default NetworkServers;
