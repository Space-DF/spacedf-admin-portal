import { useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { ME_QUERY_KEY } from '@/constants/query-keys';

import { User } from '@/types';

export const getMe = async () => apiClient.get<User>('/api/auth/me');

export const useMe = () =>
  useQuery<User>({
    queryKey: ME_QUERY_KEY,
    queryFn: getMe,
    refetchOnWindowFocus: false,
  });
