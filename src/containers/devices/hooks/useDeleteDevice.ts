import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import queryString from 'query-string';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

export const useDeleteDevice = () => {
  const t = useTranslations('organization');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.delete(
        queryString.stringifyUrl({
          url: `/api/devices/${id}`,
        }),
      ),
    onSuccess: () => {
      toast.success(t('delete_device_success'));
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: () => {
      toast.error(t('delete_device_error'));
    },
  });
};
