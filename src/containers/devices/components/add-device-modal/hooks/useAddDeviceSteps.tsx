import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import AddApiDevice from '@/containers/devices/components/add-device-modal/components/add-api-device';
import AddDeviceAuto from '@/containers/devices/components/add-device-modal/components/add-device-auto';
import AddDeviceSuccessModal from '@/containers/devices/components/add-device-modal/components/add-device-success';
import AddEUI from '@/containers/devices/components/add-device-modal/components/add-eui';
import AddDeviceLoading from '@/containers/devices/components/add-device-modal/components/loading';
import ScanQR from '@/containers/devices/components/add-device-modal/components/scan-qr';
import SelectConnectivity from '@/containers/devices/components/add-device-modal/components/select-connectivity';
import SelectMode from '@/containers/devices/components/add-device-modal/components/select-mode';
import {
  AddDeviceResponse,
  ConnectivityType,
  Step,
  Steps,
} from '@/containers/devices/components/add-device-modal/types';
import { ApiDevice } from '@/containers/devices/components/add-device-modal/validator';

interface Params {
  onNextStep: () => void | Promise<void>;
  addDeviceResponse?: AddDeviceResponse;
  apiForm: UseFormReturn<ApiDevice>;
  connectivityType: ConnectivityType;
}

/** Header copy and body component for every step of the modal. */
export const useAddDeviceSteps = ({
  onNextStep,
  addDeviceResponse,
  apiForm,
  connectivityType,
}: Params): Record<Step, Steps> => {
  const t = useTranslations('organization');

  return useMemo(
    () => ({
      select_mode: {
        label: t('add_device'),
        description: t('choose_brand'),
        component: <SelectMode />,
      },
      select_connectivity: {
        label: t('add_device'),
        description: t('choose_connect'),
        component: <SelectConnectivity />,
      },
      scan_qr: {
        label: t('auto_detect'),
        description: t('scan_description'),
        component: <ScanQR />,
      },
      loading: {
        label: t('add_device'),
        component: <AddDeviceLoading onNextStep={onNextStep} />,
      },
      add_device_auto: {
        label: t('your_device'),
        description: t('select_device_brand_type_proceed'),
        component: <AddDeviceAuto />,
      },
      add_eui: {
        label: t('add_device'),
        description: t('provide_lorawan_along_with_corresponding_name'),
        component: <AddEUI />,
      },
      add_api_device: {
        label: t('add_api_device'),
        description: t('add_api_device_description'),
        component: (
          <FormProvider {...apiForm}>
            <AddApiDevice />
          </FormProvider>
        ),
      },
      add_device_success: {
        label:
          connectivityType === ConnectivityType.Api
            ? t('add_api_device')
            : t('add_lorawan_device'),
        component: <AddDeviceSuccessModal response={addDeviceResponse} />,
      },
    }),
    [t, onNextStep, addDeviceResponse, apiForm, connectivityType],
  );
};
