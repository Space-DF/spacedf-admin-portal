import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

export const useResetPassword = () => {
  const t = useTranslations('auth');
  return useMutation({
    mutationFn: (arg: { token: string; password: string }) =>
      apiClient.post('/api/auth/forget-password', arg),
    onSuccess: () => {
      toast.success(t('password_reset_successful'));
    },
    onError: () => {
      toast.error(t('password_reset_failed'));
    },
  });
};
