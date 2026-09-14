import { useCallback, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import {
  stepApi,
  stepAuto,
  stepManual,
} from '@/containers/devices/components/add-device-modal/constants';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import {
  AddDeviceMode,
  ConnectivityType,
  Step,
} from '@/containers/devices/components/add-device-modal/types';

interface Params {
  onExit: () => void;
}

export const useAddDeviceNavigation = ({ onExit }: Params) => {
  const {
    step,
    stepIndex,
    setStep,
    setStepIndex,
    selectedMode,
    connectivityType,
  } = useAddDeviceModalStore(
    useShallow((state) => ({
      step: state.step,
      stepIndex: state.stepIndex,
      setStep: state.setStep,
      setStepIndex: state.setStepIndex,
      selectedMode: state.selectedMode,
      connectivityType: state.connectivityType,
    })),
  );

  const selectedStep = useMemo(() => {
    if (connectivityType === ConnectivityType.Api) return stepApi;
    return selectedMode === AddDeviceMode.Auto ? stepAuto : stepManual;
  }, [selectedMode, connectivityType]);

  const currentStepIndex = useMemo(
    () =>
      selectedStep.findIndex((s, index) => s === step && index === stepIndex),
    [selectedStep, step, stepIndex],
  );

  const isLastStep = currentStepIndex === selectedStep.length - 1;

  const goToIndex = useCallback(
    (index: number) => {
      setStepIndex(index);
      setStep(selectedStep[index]);
    },
    [selectedStep, setStep, setStepIndex],
  );

  const advance = useCallback(() => {
    if (currentStepIndex === -1 || isLastStep) return;
    goToIndex(currentStepIndex + 1);
  }, [currentStepIndex, isLastStep, goToIndex]);

  const goBack = useCallback(() => {
    if (currentStepIndex <= 0) {
      return onExit();
    }
    const previousIndex =
      selectedStep[currentStepIndex - 1] === Step.Loading
        ? currentStepIndex - 2
        : currentStepIndex - 1;
    goToIndex(previousIndex);
  }, [currentStepIndex, selectedStep, onExit, goToIndex]);

  const goToSuccess = useCallback(() => {
    setStep(Step.AddDeviceSuccess);
    setStepIndex(0);
  }, [setStep, setStepIndex]);

  return {
    step,
    connectivityType,
    isLastStep,
    advance,
    goBack,
    goToSuccess,
  };
};
