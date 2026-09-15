import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

import { DEVICE_QUERY_KEY, DEVICES_QUERY_KEY } from '@/constants/query-keys';

import { type UpdateDevicePayload } from '@/types';
import { type MonitoringArea } from '@/types/device';

export type SensorMove = {
  id: string;
  location?: [number, number];
  area?: MonitoringArea | null;
};

export const useSaveSensorLocation = () => {
  const t = useTranslations('monitoring');
  const queryClient = useQueryClient();

  return useMutation({
    scope: { id: 'sensor-location' },
    mutationFn: ({ id, location, area }: SensorMove) => {
      const payload: UpdateDevicePayload = {
        ...(location && {
          location: { latitude: location[1], longitude: location[0] },
        }),
        ...(area !== undefined && { cells: area }),
      };
      return apiClient.patch(`/api/devices/${id}`, payload);
    },
    onSuccess: (_data, { id }) => {
      toast.success(t('sensor_location_saved'));
      queryClient.invalidateQueries({ queryKey: DEVICES_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...DEVICE_QUERY_KEY, id],
      });
    },
    onError: () => {
      toast.error(t('sensor_location_save_failed'));
    },
  });
};
