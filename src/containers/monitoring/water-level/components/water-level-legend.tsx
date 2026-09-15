'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { WaterLevelLegend as Legend } from '@/containers/map/components/water-level-legend';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';

export const WaterLevelLegend = ({ className }: { className?: string }) => {
  const { control } = useFormContext<WaterLevelFormValues>();
  const thresholds = useWatch({ control, name: 'thresholds' });
  const zoneColors = useWatch({ control, name: 'zoneColors' });

  return (
    <Legend
      thresholds={thresholds}
      zoneColors={zoneColors}
      className={className}
    />
  );
};
