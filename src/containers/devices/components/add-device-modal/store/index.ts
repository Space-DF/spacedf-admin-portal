import { create } from 'zustand';

import {
  AddDeviceMode,
  Step,
} from '@/containers/devices/components/add-device-modal/types';

import { NetworkServer } from '@/types';

interface AddDeviceModalState {
  step: Step;
  selectedMode: AddDeviceMode;
  setSelectedMode: (mode: AddDeviceMode) => void;
  setStep: (step: Step) => void;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  file?: File;
  setFile: (file?: File) => void;
  selectedBrand?: string;
  setSelectedBrand: (brand?: string) => void;
  networkServer?: NetworkServer;
  setNetworkServer: (server?: NetworkServer) => void;
  onClear: () => void;
}

export const useAddDeviceModalStore = create<AddDeviceModalState>((set) => ({
  step: Step.SelectMode,
  selectedMode: AddDeviceMode.Manual,
  setSelectedMode: (mode: AddDeviceMode) => set({ selectedMode: mode }),
  setStep: (step: Step) => set({ step }),
  stepIndex: 0,
  setStepIndex: (index: number) => set({ stepIndex: index }),
  file: undefined,
  setFile: (file?: File) => set({ file }),
  selectedBrand: undefined,
  setSelectedBrand: (brand?: string) => set({ selectedBrand: brand }),
  networkServer: undefined,
  setNetworkServer: (server?: NetworkServer) => set({ networkServer: server }),
  onClear: () =>
    set({
      step: Step.SelectMode,
      selectedMode: AddDeviceMode.Manual,
      stepIndex: 0,
      file: undefined,
      selectedBrand: undefined,
      networkServer: undefined,
    }),
}));
