import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';

import {
  ApiDevice,
  ApiDeviceSchema,
  EUIDevice,
  EUISchema,
} from '@/containers/devices/components/add-device-modal/validator';

export const useAddDeviceForms = () => {
  const euiForm = useForm<EUIDevice>({
    resolver: zodResolver(EUISchema),
    mode: 'onSubmit',
    defaultValues: {
      eui: [],
    },
  });

  const apiForm = useForm<ApiDevice>({
    resolver: zodResolver(ApiDeviceSchema),
    mode: 'onSubmit',
    defaultValues: {
      api_devices: [],
    },
  });

  const resetForms = useCallback(() => {
    euiForm.reset({ eui: [] });
    apiForm.reset({ api_devices: [] });
  }, [euiForm, apiForm]);

  return { euiForm, apiForm, resetForms };
};
