import {
  AutomationSettings,
  CodeSandbox,
  Devices,
  Square,
  Warehouse,
} from '@/components/icons';

export enum NavigationEnums {
  DASHBOARD = 'dashboard',
  DEVICES = 'devices',
  WORKSPACE_SETTINGS = '/workspace-settings',
  GEOFENCES = 'geofences',
  AUTOMATION_SETTINGS = '/automation-settings',
}

export type Navigation = {
  href: `${NavigationEnums}`;
  title: string;
  icon?: React.ReactElement;
  isDynamic?: boolean;
  isAlwayEnabled?: boolean;
  onClick?: () => void;
  key:
    | 'devices'
    | 'dashboard'
    | 'workspace_settings'
    | 'geofences'
    | 'automation_settings';
};

export type DynamicLayout =
  | NavigationEnums.DASHBOARD
  | NavigationEnums.DEVICES
  | NavigationEnums.GEOFENCES
  | NavigationEnums.AUTOMATION_SETTINGS;

export const NavigationData = [
  {
    key: 'devices',
    href: NavigationEnums.DEVICES,
    title: 'Devices',
    icon: <Devices />,
    isDynamic: true,
    isDisplay: true,
  },
  {
    key: 'dashboard',
    href: NavigationEnums.DASHBOARD,
    title: 'Dashboard',
    icon: <CodeSandbox />,
    isDynamic: true,
    isDisplay: true,
  },
  {
    key: 'geofences',
    href: NavigationEnums.GEOFENCES,
    title: 'Geofences',
    icon: <Square />,
    isDynamic: true,
  },
  {
    key: 'workspace_settings',
    href: NavigationEnums.WORKSPACE_SETTINGS,
    title: 'Space settings',
    icon: <Warehouse />,
  },
  {
    key: 'automation_settings',
    href: NavigationEnums.AUTOMATION_SETTINGS,
    title: 'Automation Setting',
    icon: <AutomationSettings />,
  },
];

export const dynamicLayoutKeys: DynamicLayout[] = [
  NavigationEnums.DASHBOARD,
  NavigationEnums.DEVICES,
  NavigationEnums.GEOFENCES,
];
