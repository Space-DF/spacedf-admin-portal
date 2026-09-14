import { useMutation } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

export const useSendOtp = () =>
  useMutation({
    mutationFn: (email: string) =>
      apiClient.post('/api/auth/send-otp', { email }),
  });
