import dayjs from 'dayjs';
import { Hexagon, Map } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ReactNode, useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { useDevice } from '@/containers/devices/containers/device-detail/hooks/useDevice';
import { CELL_SIZE_LABEL_KEY } from '@/containers/map/components/cell-size-select';
import {
  areaCellCount,
  areaSquareMetres,
  squareMetresMeasure,
} from '@/containers/map/utils';
import { useGetWaterLevelSetting } from '@/containers/monitoring/water-level/hooks/use-monitoring-settings';
import { DEFAULT_WATER_LEVEL } from '@/containers/monitoring/water-level/schema';
import { toWaterLevelFormValues } from '@/containers/monitoring/water-level/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  unit?: string;
  isLoading?: boolean;
}

const StatCard = ({ icon, label, value, unit, isLoading }: StatCardProps) => (
  <div className='flex flex-1 items-center gap-2 rounded-lg border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-2'>
    <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-component-fill-secondary-soft text-brand-component-text-secondary'>
      {icon}
    </div>
    <div className='min-w-0 flex-1 space-y-1'>
      <p className='text-xs font-medium text-brand-component-text-dark'>
        {label}
      </p>
      {isLoading ? (
        <Skeleton className='h-7 w-28' />
      ) : (
        <div className='flex flex-wrap items-baseline gap-x-1'>
          <span className='text-xl font-semibold text-brand-component-text-dark'>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          <span className='whitespace-nowrap text-xs text-brand-component-text-gray'>
            {unit}
          </span>
        </div>
      )}
    </div>
  </div>
);

interface Props {
  deviceId: string;
}

const MonitoringArea = ({ deviceId }: Props) => {
  const t = useTranslations('device-detail');
  const tMonitoring = useTranslations('monitoring');

  const { data: device, isLoading: isLoadingDevice } = useDevice(deviceId);
  const { data: setting, isLoading: isLoadingSetting } =
    useGetWaterLevelSetting();

  const isLoading = isLoadingDevice || isLoadingSetting;

  const { cellResolution } = setting
    ? toWaterLevelFormValues(setting)
    : DEFAULT_WATER_LEVEL;

  const area = device?.cells ?? null;

  const selectedCells = useMemo(
    () => areaCellCount(area, cellResolution),
    [area, cellResolution],
  );

  const coverageArea = useMemo(
    () => squareMetresMeasure(areaSquareMetres(area)),
    [area],
  );

  const cellSizeLabel = tMonitoring(CELL_SIZE_LABEL_KEY[cellResolution]);
  const lastUpdated = device?.updated_at
    ? dayjs(device.updated_at).format('MMM D, YYYY - HH:mm')
    : '—';

  return (
    <div className='rounded-xl border border-brand-component-stroke-dark-soft p-4'>
      <div className='space-y-3'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <p className='flex-1 truncate text-lg font-semibold text-brand-component-text-dark'>
              {t('monitoring_area')}
            </p>
            {isLoadingDevice ? (
              <Skeleton className='h-5 w-36' />
            ) : (
              <span className='text-sm text-brand-component-text-gray'>
                {t('last_updated')}: {lastUpdated}
              </span>
            )}
          </div>
          <p className='text-xs text-brand-component-text-gray'>
            {t('monitoring_area_description')}
          </p>
        </div>
        <div className='flex items-stretch gap-3'>
          <StatCard
            icon={<Map className='size-6' />}
            label={t('coverage_area')}
            value={coverageArea.value}
            unit={coverageArea.unit}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Hexagon className='size-6' />}
            label={t('selected_cells')}
            value={selectedCells}
            unit={t('cells')}
            isLoading={isLoading}
          />
          <StatCard
            icon={<Hexagon className='size-6' />}
            label={t('grid_cell_size')}
            value={cellSizeLabel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default MonitoringArea;
