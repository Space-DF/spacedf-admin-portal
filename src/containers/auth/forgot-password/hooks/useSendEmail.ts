import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

const fetcher = async (url: string, { arg }: { arg: { email: string } }) => {
  return apiClient.post(url, arg);
};

export const useSendEmail = () => {
  const t = useTranslations('auth');
  return useSWRMutation('/api/auth/send-email', fetcher, {
    onSuccess: () => {
      toast.success(t('email_sent'));
    },
    onError: () => {
      toast.error(t('email_not_sent'));
    },
  });
};
