import { Step } from '@/containers/devices/components/add-device-modal/types';

export const stepAuto = [
  Step.SelectMode,
  Step.ScanQR,
  Step.Loading,
  Step.AddDeviceAuto,
  Step.Loading,
  Step.AddEUI,
];

export const stepManual = [Step.SelectMode, Step.AddDeviceManual, Step.AddEUI];

export const modalContentVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const,
    },
  },
} as const;
