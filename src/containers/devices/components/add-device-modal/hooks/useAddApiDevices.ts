import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { AddDeviceErrorResponse } from '@/containers/devices/components/add-device-modal/types';
import { ApiDevice } from '@/containers/devices/components/add-device-modal/validator';
import { useAddDevice } from '@/containers/devices/hooks/useAddDevices';

import { ApiDeviceInfo, ApiResponse } from '@/types';

export const useAddApiDevices = (form: UseFormReturn<ApiDevice>) => {
  const t = useTranslations('organization');
  const {
    mutateAsync: createDevice,
    isPending: isCreating,
    data: addDeviceResponse,
  } = useAddDevice();

  const { setError, trigger, getValues, reset } = form;

  const submit = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) return false;

    const data = getValues('api_devices').map(
      ({ device_model, is_published, serial_number, claim_code }) => {
        const serialNumber = serial_number?.trim();
        const claimCode = claim_code?.trim();
        return {
          device_model,
          is_published,
          ...(claimCode ? { claim_code: claimCode } : {}),
          ...(serialNumber
            ? { api_device: { serial_number: serialNumber } }
            : {}),
        };
      },
    );

    try {
      await createDevice(data);
      reset({ api_devices: [] });
      return true;
    } catch (error) {
      const errorResponse = (error as ApiResponse<AddDeviceErrorResponse[]>)
        .response?.response;
      errorResponse?.forEach(({ api_device, claim_code }, index) => {
        Object.entries(api_device ?? {}).forEach(([key, messages]) => {
          setError(`api_devices.${index}.${key as keyof ApiDeviceInfo}`, {
            message: messages?.[0],
          });
        });
        if (claim_code?.length) {
          setError(`api_devices.${index}.claim_code`, {
            message: claim_code[0],
          });
        }
      });
      toast.error(t('add_devices_error'));
      return false;
    }
  }, [trigger, getValues, createDevice, reset, setError, t]);

  return { submit, isCreating, addDeviceResponse };
};
