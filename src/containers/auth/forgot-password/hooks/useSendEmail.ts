import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

export const useSendEmail = () => {
  const t = useTranslations('auth');
  return useMutation({
    mutationFn: (arg: { email: string }) =>
      apiClient.post('/api/auth/send-email', arg),
    onSuccess: () => {
      toast.success(t('email_sent'));
    },
    onError: () => {
      toast.error(t('email_not_sent'));
    },
  });
};
