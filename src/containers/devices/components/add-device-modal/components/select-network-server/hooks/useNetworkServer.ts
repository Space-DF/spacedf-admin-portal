import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import apiClient from '@/lib/api-client';

import { NETWORK_SERVER_QUERY_KEY } from '@/constants/query-keys';

import { Response } from '@/types/global';
import { NetworkServer } from '@/types/network-server';

export const useNetworkServer = (search = '', page = 1) => {
  return useQuery<Response<NetworkServer>>({
    queryKey: [...NETWORK_SERVER_QUERY_KEY, { search, page }],
    queryFn: () =>
      apiClient.get<Response<NetworkServer>>(
        queryString.stringifyUrl({
          url: '/api/network-server',
          query: {
            search,
            offset: (page - 1) * 7,
          },
        }),
      ),
  });
};
