'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';

import { GEOCODING_REVERSE_QUERY_KEY } from '@/constants/query-keys';
import { geocodingService } from '@/utils/map-geocoding';

const ADDRESS_STALE_TIME = 30 * 60 * 1000;

export const useSensorAddress = (coords: [number, number] | null) => {
  const locale = useLocale();

  const key = coords ? `${coords[0]},${coords[1]}` : '';

  const { data, isFetching } = useQuery({
    queryKey: [...GEOCODING_REVERSE_QUERY_KEY, key, locale],
    queryFn: () => {
      const [lng, lat] = key.split(',').map(Number);
      return geocodingService.reverse([lng, lat], { language: locale });
    },
    enabled: !!key,
    staleTime: ADDRESS_STALE_TIME,
  });

  return {
    address: data ?? null,
    isLoading: !!key && isFetching,
  };
};
