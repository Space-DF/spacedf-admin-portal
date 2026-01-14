import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';
const fetcher = async (
  url: string,
  { arg }: { arg: { token: string; password: string } },
) => apiClient.post(url, arg);

export const useResetPassword = () => {
  const t = useTranslations('auth');
  return useSWRMutation('/api/auth/forget-password', fetcher, {
    onSuccess: () => {
      toast.success(t('password_reset_successful'));
    },
    onError: () => {
      toast.error(t('password_reset_failed'));
    },
  });
};
