export type Checkpoint = {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy: number;
};

export type Trip = {
  id: string;
  space_device_id: string;
  device_id: string;
  device_name: string;
  started_at: string;
  is_finished: boolean;
  last_latitude: number;
  last_longitude: number;
  last_report: number;
  checkpoints: Checkpoint[];
};
