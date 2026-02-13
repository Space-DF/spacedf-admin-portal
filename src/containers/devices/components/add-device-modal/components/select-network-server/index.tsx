import { Search } from 'lucide-react';
import { useState } from 'react';

import { useDebounce } from '@/hooks/useDebounce';

import { InputWithIcon } from '@/components/ui/input';
import NetworkServers from '@/containers/devices/components/add-device-modal/components/select-network-server/components/network-servers';
import { useNetworkServer } from '@/containers/devices/components/add-device-modal/components/select-network-server/hooks/useNetworkServer';

const PAGE_SIZE = 7;

const SelectNetworkServer = () => {
  const [search, setSearch] = useState('');

  const searchDebounce = useDebounce(search);
  const [page, setPage] = useState(1);
  const { data: networkResults, isLoading } = useNetworkServer(
    searchDebounce,
    page,
  );

  const networkServers = networkResults?.results || [];

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
      </div>
      <div className='space-y-2'>
        <NetworkServers networkServers={networkServers} isLoading={isLoading} />
      </div>
      <div className='flex items-center justify-between pt-4'>
        <button
          className='px-4 py-2 border rounded disabled:opacity-50'
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className='text-sm text-gray-600'>
          Show {(page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, networkResults?.count || 0)} of{' '}
          {networkResults?.count || 0} results
        </span>
        <button
          className='px-4 py-2 border rounded disabled:opacity-50'
          onClick={() =>
            setPage((p) =>
              Math.min(
                Math.ceil(networkResults?.count || 0 / PAGE_SIZE),
                p + 1,
              ),
            )
          }
          disabled={page >= Math.ceil((networkResults?.count || 0) / PAGE_SIZE)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectNetworkServer;
