export type DataMode = 'preview' | 'real';

export type DrawTool = 'paint' | 'erase' | 'pan';

export type WaterZoneShape = {
  id: string;
  cells: string[];
  color: string;
};

export type WaterColumn = {
  id?: string;
  h3: string;
  color: string;
  fill: number;
  image: string;
  name?: string;
};

export type WaterLevelOverlay = {
  resolution: number;
  zones: WaterZoneShape[];
  columns: WaterColumn[];
  selectedZoneId?: string | null;
  editingId?: string | null;
  show: {
    coverage: boolean;
    columns: boolean;
  };
};
