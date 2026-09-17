import { useInfiniteQuery } from '@tanstack/react-query';
import queryString from 'query-string';

import apiClient from '@/lib/api-client';

import { DEVICE_MODELS_QUERY_KEY } from '@/constants/query-keys';

import { DeviceModel } from '@/types/device';
import { Response } from '@/types/global';

const DEFAULT_LIMIT = 8;

export const useDeviceModel = (search = '', limit = DEFAULT_LIMIT) => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [...DEVICE_MODELS_QUERY_KEY, { search, limit }],
      queryFn: ({ pageParam }) =>
        apiClient.get<Response<DeviceModel>>(
          queryString.stringifyUrl({
            url: '/api/device-models',
            query: {
              search,
              limit,
              offset: pageParam,
            },
          }),
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.next ? allPages.length * limit : undefined,
    });

  const deviceModels = data ? data.pages.flatMap((page) => page.results) : [];
  const isLoadingMore = isLoading || isFetchingNextPage;

  return {
    deviceModels,
    isLoading,
    isLoadingMore,
    hasMore: hasNextPage,
    fetchNextPage,
  };
};
