import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import queryString from 'query-string';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

import { MONITORING_QUERY_KEY } from '@/constants/query-keys';

import { MonitoringSetting, UpdateMonitoringPayload } from '@/types';

const fetchMonitoringSettings = (slugName: string) =>
  apiClient.get<MonitoringSetting[]>(
    queryString.stringifyUrl({
      url: '/api/organizations/monitoring',
      query: { slugName },
    }),
  );

export const useGetWaterLevelSetting = () => {
  const { slugName } = useParams<{ slugName: string }>();

  return useQuery<MonitoringSetting[], Error, MonitoringSetting | undefined>({
    queryKey: [...MONITORING_QUERY_KEY, slugName],
    queryFn: async () => fetchMonitoringSettings(slugName),
    select: (settings) =>
      settings.find((setting) => setting.type === 'water_level'),
    enabled: !!slugName,
  });
};

export const useUpdateMonitoringSetting = () => {
  const queryClient = useQueryClient();
  const { slugName } = useParams<{ slugName: string }>();
  const t = useTranslations('monitoring');

  return useMutation<
    MonitoringSetting,
    Error,
    { id: string; data: UpdateMonitoringPayload }
  >({
    mutationFn: async ({ id, data }) =>
      apiClient.patch<MonitoringSetting>(
        queryString.stringifyUrl({
          url: `/api/organizations/monitoring/${id}`,
          query: { slugName },
        }),
        data,
      ),
    onSuccess: (updated) => {
      queryClient.setQueryData<MonitoringSetting[]>(
        [...MONITORING_QUERY_KEY, slugName],
        (settings) =>
          settings?.map((setting) =>
            setting.id === updated.id ? updated : setting,
          ),
      );
      queryClient.invalidateQueries({
        queryKey: [...MONITORING_QUERY_KEY, slugName],
      });
      toast.success(t('settings_saved'));
    },
    onError: (error) => {
      toast.error(error.message || t('settings_save_failed'));
    },
  });
};
