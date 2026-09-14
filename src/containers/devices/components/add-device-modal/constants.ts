import { Variants } from 'framer-motion';

import { Step } from '@/containers/devices/components/add-device-modal/types';

export const stepAuto = [
  Step.SelectMode,
  Step.SelectConnectivity,
  Step.ScanQR,
  Step.Loading,
  Step.AddDeviceAuto,
  Step.Loading,
  Step.AddEUI,
];

export const stepManual = [
  Step.SelectMode,
  Step.SelectConnectivity,
  Step.AddEUI,
];

export const stepApi = [
  Step.SelectMode,
  Step.SelectConnectivity,
  Step.AddApiDevice,
];

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const dialogWidthTransition = {
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1],
} as const;
