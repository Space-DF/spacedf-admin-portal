import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { Response } from '@/types/global';
import { NetworkServer } from '@/types/network-server';

const getNetworkServer = async (
  url: string,
): Promise<Response<NetworkServer>> => apiClient.get(url);

export const useNetworkServer = (search = '', page = 1) => {
  return useSWR(
    `/api/network-server?search=${search}&offset=${(page - 1) * 7}`,
    getNetworkServer,
  );
};
