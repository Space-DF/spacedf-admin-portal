import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { User } from '@/types';

const getMe = async (url: string) => apiClient.get<User>(url);

export const useMe = () => {
  return useSWR<User>('/api/auth/me', getMe);
};
