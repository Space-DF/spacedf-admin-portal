import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

import { ProfileSchema } from '@/components/layouts/components/account-settings/components/profile/schema';

const updateProfile = async (url: string, { arg }: { arg: ProfileSchema }) => {
  const formData = new FormData();
  Object.entries(arg).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value as string | Blob);
    }
  });
  return apiClient.put(url, formData);
};

export const useUpdateProfile = () => {
  return useSWRMutation('/api/auth/me', updateProfile);
};
