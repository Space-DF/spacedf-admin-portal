import { create } from 'zustand';

export type DeviceTab = 'active' | 'in_inventory';

type DeviceTabStore = {
  activeTab: DeviceTab;
};

type DeviceTabActions = {
  setActiveTab: (tab: DeviceTab) => void;
};

export const useDeviceTabStore = create<DeviceTabStore & DeviceTabActions>(
  (set) => ({
    activeTab: 'in_inventory',
    setActiveTab: (tab) => set({ activeTab: tab }),
  }),
);
