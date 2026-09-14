import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import queryString from 'query-string';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

export const useDeleteDevice = () => {
  const t = useTranslations('organization');
  const { slugName } = useParams<{ slugName: string }>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.delete(
        queryString.stringifyUrl({
          url: `/api/devices/${id}`,
          query: { slugName },
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
