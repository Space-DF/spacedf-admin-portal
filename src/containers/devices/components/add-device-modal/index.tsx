import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  modalContentVariants,
  stepAuto,
  stepManual,
} from '@/containers/devices/components/add-device-modal/constants';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { useAddDevice } from '@/containers/devices/hooks/useAddDevices';
import { useDeviceTabStore } from '@/containers/devices/stores/useDeviceTab';

import AddDeviceAuto from './components/add-device-auto';
import AddDeviceManual from './components/add-device-manual';
import AddDeviceSuccessModal from './components/add-device-success';
import AddEUI from './components/add-eui';
import AddDeviceLoading from './components/loading';
import ScanQR from './components/scan-qr';
import SelectMode from './components/select-mode';
import { AddDeviceMode, Step, Steps } from './types';
import { EUIDevice, EUISchema } from './validator';

import { ApiResponse, Device } from '@/types';

interface Props {
  children: React.ReactNode;
}

const AddDeviceModal: React.FC<Props> = ({ children }) => {
  const t = useTranslations('organization');
  const [open, setOpen] = useState(false);
  const {
    step,
    selectedMode,
    setStep,
    stepIndex,
    setStepIndex,
    file,
    selectedBrand,
    onClear,
    networkServer,
  } = useAddDeviceModalStore(
    useShallow((state) => ({
      step: state.step,
      selectedMode: state.selectedMode,
      setStep: state.setStep,
      stepIndex: state.stepIndex,
      setStepIndex: state.setStepIndex,
      file: state.file,
      selectedBrand: state.selectedBrand,
      onClear: state.onClear,
      networkServer: state.networkServer,
    })),
  );

  const setActiveTab = useDeviceTabStore((state) => state.setActiveTab);

  const { trigger: createDevice, isMutating: isCreating } = useAddDevice();

  const selectedStep = useMemo(() => {
    return selectedMode === AddDeviceMode.Auto ? stepAuto : stepManual;
  }, [selectedMode]);

  const isShowBackIcon =
    step !== Step.SelectMode && step !== Step.AddDeviceSuccess;

  const form = useForm<EUIDevice>({
    resolver: zodResolver(EUISchema),
    mode: 'onChange',
  });

  const {
    formState: { isValid },
    watch,
  } = form;
  const { mutate } = useSWRConfig();

  const handleAddDevice = useCallback(
    async (devices: EUIDevice['eui']) => {
      if (!selectedBrand || !networkServer) return;
      const data = devices.map((device) => ({
        device_model: selectedBrand,
        network_server: networkServer.id,
        lorawan_device: device,
        is_published: device.is_published,
      }));
      await createDevice(data, {
        onError: (error: ApiResponse<Device[]>) => {
          const errorResponse = error.response?.response;
          if (errorResponse) {
            errorResponse.forEach((err, index) => {
              const lorawanError = err.lorawan_device;
              if (lorawanError) {
                Object.keys(lorawanError).forEach((key) => {
                  form.setError(
                    `eui.${index}.${key as keyof Device['lorawan_device']}`,
                    {
                      message:
                        lorawanError[
                          key as keyof Device['lorawan_device']
                        ]?.[0],
                    },
                  );
                });
              }
            });
          }
          toast.error(t('add_devices_error'));
        },
        onSuccess: async () => {
          await mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/devices'),
            undefined,
            { revalidate: true },
          );
        },
      });
    },
    [selectedBrand, networkServer],
  );

  const deviceEUIs = watch('eui');

  const onNextStep = useCallback(async () => {
    const currentStepIndex = selectedStep.findIndex(
      (s, index) => s === step && index === stepIndex,
    );
    if (currentStepIndex === -1) return;
    if (currentStepIndex === selectedStep.length - 1) {
      const isValid = await form.trigger();
      if (!isValid) return;
      const formattedDeviceEUIs = deviceEUIs.map((eui) => ({
        ...eui,
        dev_eui: eui.dev_eui.replace(/\s+/g, ''),
        join_eui: eui.join_eui.replace(/\s+/g, ''),
      }));
      await handleAddDevice(formattedDeviceEUIs);
      setStep(Step.AddDeviceSuccess);
      setStepIndex(0);
      form.reset({
        eui: [],
      });
      return;
    }
    setStepIndex(currentStepIndex + 1);
    setStep(selectedStep[currentStepIndex + 1]);
  }, [
    selectedStep,
    setStepIndex,
    setStep,
    step,
    stepIndex,
    handleAddDevice,
    deviceEUIs,
    form,
  ]);

  const handleReset = () => {
    setOpen(false);
    onClear();
    form.reset({
      eui: [],
    });
  };

  const handleDone = () => {
    handleReset();
    setActiveTab('in_inventory');
  };

  const handleBackStep = () => {
    const currentStepIndex = selectedStep.findIndex(
      (s, index) => s === step && index === stepIndex,
    );
    if (currentStepIndex <= 0) {
      return handleReset();
    }
    if (selectedStep[currentStepIndex - 1] === Step.Loading) {
      const newIndex = currentStepIndex - 2;
      setStep(selectedStep[newIndex]);
      setStepIndex(newIndex);
      return;
    }
    const newIndex = currentStepIndex - 1;
    setStepIndex(newIndex);
    setStep(selectedStep[newIndex]);
  };

  const steps: Record<Step, Steps> = useMemo(
    () => ({
      select_mode: {
        label: t('add_device'),
        description: t('choose_brand'),
        component: <SelectMode />,
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
      add_device_manual: {
        label: t('your_device'),
        description: t('select_device_brand_type_proceed'),
        component: <AddDeviceManual />,
      },
      add_eui: {
        label: t('add_eui'),
        description: t('provide_lorawan_along_with_corresponding_name'),
        component: <AddEUI />,
      },
      add_device_success: {
        label: t('add_lorawan_device'),
        component: <AddDeviceSuccessModal />,
      },
    }),
    [t, onNextStep],
  );

  const isDisabled =
    (!file && step === Step.ScanQR) ||
    (step === Step.AddEUI &&
      (!isValid || !deviceEUIs.length || !networkServer)) ||
    (step === Step.AddDeviceManual && !selectedBrand);

  const isShowFooter = step !== Step.Loading && step !== Step.AddDeviceSuccess;

  return (
    <Dialog open={open} onOpenChange={open ? handleReset : setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className='text-sm p-6 min-w-[600px] max-w-[1200px] w-fit max-h-[calc(100vh-20px)] overflow-y-auto'
        onInteractOutside={(e) => {
          if (step !== Step.SelectMode) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className='border-none p-0 space-y-4'>
          <DialogTitle className='flex items-center gap-2.5'>
            {isShowBackIcon && (
              <ArrowLeft
                className='cursor-pointer'
                size={20}
                onClick={handleBackStep}
              />
            )}{' '}
            {steps[step].label}
          </DialogTitle>
          {steps[step].description && (
            <DialogDescription className='text-xs'>
              {steps[step].description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className='mb-6 mt-4'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={step}
              initial='initial'
              animate='animate'
              exit='exit'
              variants={modalContentVariants}
            >
              <FormProvider {...form}>{steps[step].component}</FormProvider>
            </motion.div>
          </AnimatePresence>
        </div>
        {isShowFooter && (
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              className='text-brand-component-text-gray'
              onClick={handleBackStep}
              size='xl'
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={isDisabled}
              onClick={onNextStep}
              loading={isCreating}
              size='xl'
            >
              {t('next')}
            </Button>
          </DialogFooter>
        )}
        {step === Step.AddDeviceSuccess && (
          <DialogFooter className='w-full'>
            <Button type='button' className='w-full' onClick={handleDone}>
              {t('done')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceModal;
