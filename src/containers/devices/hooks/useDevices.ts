import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { useMemo } from 'react';

import apiClient from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';

import { DEVICES_QUERY_KEY } from '@/constants/query-keys';

import { Device, Response } from '@/types';

export type DeviceStatusFilter = 'active' | 'inactive' | 'in_inventory' | '';

export const useDevices = (
  search: string,
  status?: DeviceStatusFilter,
  pageIndex = 0,
  limit = 10,
  location?: boolean,
  key_feature?: string,
) => {
  const deviceNameDebounced = useDebounce(search);
  return useQuery<Response<Device>>({
    queryKey: [
      ...DEVICES_QUERY_KEY,
      {
        search: deviceNameDebounced,
        status,
        pageIndex,
        limit,
        location,
        key_feature,
      },
    ],
    queryFn: () =>
      apiClient.get<Response<Device>>(
        queryString.stringifyUrl({
          url: '/api/devices',
          query: {
            search: deviceNameDebounced,
            status,
            pageIndex,
            limit,
            location,
            key_feature,
          },
        }),
      ),
  });
};

export const useInfiniteDevices = (
  search: string,
  limit = 10,
  location?: boolean,
  key_feature?: string,
) => {
  const deviceNameDebounced = useDebounce(search);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: [
        ...DEVICES_QUERY_KEY,
        {
          infinite: true,
          search: deviceNameDebounced,
          limit,
          location,
          key_feature,
        },
      ],
      queryFn: ({ pageParam }) =>
        apiClient.get<Response<Device>>(
          queryString.stringifyUrl({
            url: '/api/devices',
            query: {
              search: deviceNameDebounced,
              pageIndex: pageParam,
              limit,
              location,
              key_feature,
            },
          }),
        ),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.next ? allPages.length : undefined,
    });

  const devices = useMemo(
    () => data?.pages.flatMap((page) => page.results) ?? [],
    [data],
  );

  return {
    devices,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  };
};
