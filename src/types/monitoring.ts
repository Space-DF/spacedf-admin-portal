export type MonitoringType = 'water_level';

export interface MonitoringThresholds {
  safe: number;
  caution: number;
  warning: number;
}

export interface MonitoringColors {
  safe: string;
  caution: string;
  warning: string;
  danger: string;
}

export interface MonitoringDisplaySettings {
  coverage: boolean;
  water_column: boolean;
}

export interface MonitoringSetting {
  id: string;
  cell_size: number;
  type: MonitoringType;
  thresholds: MonitoringThresholds;
  colors: MonitoringColors;
  display_settings: MonitoringDisplaySettings;
  created_at: string;
  updated_at: string;
}

export type UpdateMonitoringPayload = Pick<
  MonitoringSetting,
  'cell_size' | 'type' | 'thresholds' | 'colors' | 'display_settings'
>;
