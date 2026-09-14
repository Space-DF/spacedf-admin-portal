import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { PropsWithChildren, useCallback, useState } from 'react';
import { FormProvider } from 'react-hook-form';
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
  dialogWidthTransition,
  modalContentVariants,
} from '@/containers/devices/components/add-device-modal/constants';
import { useAddApiDevices } from '@/containers/devices/components/add-device-modal/hooks/useAddApiDevices';
import { useAddDeviceForms } from '@/containers/devices/components/add-device-modal/hooks/useAddDeviceForms';
import { useAddDeviceNavigation } from '@/containers/devices/components/add-device-modal/hooks/useAddDeviceNavigation';
import { useAddDeviceSteps } from '@/containers/devices/components/add-device-modal/hooks/useAddDeviceSteps';
import { useAddLorawanDevices } from '@/containers/devices/components/add-device-modal/hooks/useAddLorawanDevices';
import { useMeasuredWidth } from '@/containers/devices/components/add-device-modal/hooks/useMeasuredWidth';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { useDeviceTabStore } from '@/containers/devices/stores/useDeviceTab';

import { ConnectivityType, Step } from './types';

const AddDeviceModal: React.FC<PropsWithChildren> = ({ children }) => {
  const t = useTranslations('organization');
  const [open, setOpen] = useState(false);

  const { file, networkServer, onClear } = useAddDeviceModalStore(
    useShallow((state) => ({
      file: state.file,
      networkServer: state.networkServer,
      onClear: state.onClear,
    })),
  );
  const setActiveTab = useDeviceTabStore((state) => state.setActiveTab);

  const { euiForm, apiForm, resetForms } = useAddDeviceForms();
  const {
    submit: submitLorawanDevices,
    isCreating: isCreatingLorawanDevices,
    addDeviceResponse: lorawanDeviceResponse,
  } = useAddLorawanDevices(euiForm);
  const {
    submit: submitApiDevices,
    isCreating: isCreatingApiDevices,
    addDeviceResponse: apiDeviceResponse,
  } = useAddApiDevices(apiForm);

  const handleClose = useCallback(() => {
    setOpen(false);
    onClear();
    resetForms();
  }, [onClear, resetForms]);

  const { step, connectivityType, isLastStep, advance, goBack, goToSuccess } =
    useAddDeviceNavigation({ onExit: handleClose });

  const isApiConnectivity = connectivityType === ConnectivityType.Api;

  const onNextStep = useCallback(async () => {
    if (!isLastStep) return advance();
    const submitted = isApiConnectivity
      ? await submitApiDevices()
      : await submitLorawanDevices();
    if (submitted) goToSuccess();
  }, [
    isLastStep,
    advance,
    isApiConnectivity,
    submitApiDevices,
    submitLorawanDevices,
    goToSuccess,
  ]);

  const steps = useAddDeviceSteps({
    onNextStep,
    addDeviceResponse: isApiConnectivity
      ? apiDeviceResponse
      : lorawanDeviceResponse,
    apiForm,
    connectivityType,
  });

  const handleDone = () => {
    handleClose();
    setActiveTab('in_inventory');
  };

  const [measureRef, contentWidth] = useMeasuredWidth();

  const deviceEUIs = euiForm.watch('eui');
  const apiDevices = apiForm.watch('api_devices');

  const isShowBackIcon =
    step !== Step.SelectMode && step !== Step.AddDeviceSuccess;

  const isShowFooter =
    step !== Step.SelectMode &&
    step !== Step.Loading &&
    step !== Step.AddDeviceSuccess;

  const isDisabled =
    (!file && step === Step.ScanQR) ||
    (step === Step.AddEUI && (!deviceEUIs.length || !networkServer)) ||
    (step === Step.AddApiDevice && !apiDevices.length);

  return (
    <Dialog open={open} onOpenChange={open ? handleClose : setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {/*
        `max-w-[1200px]` is load-bearing: it overrides the `max-w-lg` that
        DialogContent applies by default, which would otherwise clamp the
        dialog to 512px and make the wider steps scroll.

        `overflow-visible` is load-bearing too: popovers inside the dialog are
        portalled into DialogContent (see `useDialogPortalContainer`), and its
        `translate-*` makes it the containing block for their fixed position.
        Any overflow other than visible here clips them, so the height cap and
        the scrolling live on the wrapper below instead.
      */}
      <DialogContent
        className='text-sm p-6 min-w-[600px] max-w-[1200px] w-fit overflow-visible'
        onInteractOutside={(e) => {
          if (step !== Step.SelectMode) {
            e.preventDefault();
          }
        }}
      >
        {/*
          The dialog is sized by its content, and `width: fit-content` cannot be
          transitioned. So the step body is measured at its natural width and
          this wrapper animates to it, which the `w-fit` dialog then follows.
          It also carries the dialog's height cap and vertical scrolling (the
          viewport height minus DialogContent's `p-6` on both sides).
        */}
        <motion.div
          className='max-h-[calc(100vh-68px)] overflow-y-auto overflow-x-hidden'
          initial={false}
          animate={{ width: contentWidth ?? 'auto' }}
          transition={dialogWidthTransition}
        >
          <DialogHeader className='border-none p-0 space-y-4'>
            <DialogTitle className='flex items-center gap-2.5'>
              {isShowBackIcon && (
                <ChevronLeft
                  className='cursor-pointer'
                  size={20}
                  onClick={goBack}
                />
              )}{' '}
              {steps[step].label}
            </DialogTitle>
            {steps[step].description && (
              <DialogDescription className='text-xs text-brand-component-text-gray'>
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
                {/*
                  `w-max` keeps the body at its natural width while the wrapper
                  animates, so the content is revealed rather than reflowed. It
                  also ignores the viewport, which `fit-content` used to clamp
                  for us, so the max width has to bring that back.
                */}
                <div
                  ref={measureRef}
                  className='w-max min-w-[552px] max-w-[min(1152px,calc(100vw-88px))]'
                >
                  <FormProvider {...euiForm}>
                    {steps[step].component}
                  </FormProvider>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          {isShowFooter && (
            <DialogFooter>
              <Button type='button' variant='outline' onClick={goBack}>
                {t('cancel')}
              </Button>
              <Button
                disabled={isDisabled}
                onClick={onNextStep}
                loading={isCreatingLorawanDevices || isCreatingApiDevices}
              >
                {step === Step.AddApiDevice ? t('add_device') : t('next')}
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
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDeviceModal;
