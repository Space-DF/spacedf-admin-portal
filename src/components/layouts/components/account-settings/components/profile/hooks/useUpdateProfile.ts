import { useMutation } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { ProfileSchema } from '@/components/layouts/components/account-settings/components/profile/schema';

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (arg: ProfileSchema) => {
      const formData = new FormData();
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value as string | Blob);
        }
      });
      return apiClient.put('/api/auth/me', formData);
    },
  });
};
