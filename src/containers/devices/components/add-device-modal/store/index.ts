import { create } from 'zustand';

import {
  AddDeviceMode,
  ConnectivityType,
  Step,
} from '@/containers/devices/components/add-device-modal/types';

import { NetworkServer } from '@/types';

interface AddDeviceModalState {
  step: Step;
  selectedMode?: AddDeviceMode;
  setSelectedMode: (mode?: AddDeviceMode) => void;
  connectivityType: ConnectivityType;
  setConnectivityType: (type: ConnectivityType) => void;
  setStep: (step: Step) => void;
  stepIndex: number;
  setStepIndex: (index: number) => void;
  file?: File;
  setFile: (file?: File) => void;
  networkServer?: NetworkServer;
  setNetworkServer: (server?: NetworkServer) => void;
  onClear: () => void;
}

export const useAddDeviceModalStore = create<AddDeviceModalState>((set) => ({
  step: Step.SelectMode,
  selectedMode: undefined,
  setSelectedMode: (mode?: AddDeviceMode) => set({ selectedMode: mode }),
  connectivityType: ConnectivityType.Lorawan,
  setConnectivityType: (type: ConnectivityType) =>
    set({ connectivityType: type }),
  setStep: (step: Step) => set({ step }),
  stepIndex: 0,
  setStepIndex: (index: number) => set({ stepIndex: index }),
  file: undefined,
  setFile: (file?: File) => set({ file }),
  networkServer: undefined,
  setNetworkServer: (server?: NetworkServer) => set({ networkServer: server }),
  onClear: () =>
    set({
      step: Step.SelectMode,
      selectedMode: undefined,
      connectivityType: ConnectivityType.Lorawan,
      stepIndex: 0,
      file: undefined,
      networkServer: undefined,
    }),
}));
