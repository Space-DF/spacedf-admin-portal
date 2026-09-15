'use client';

import { Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import { Pen, Warning } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { areaCellCount, areaSquareMetres } from '@/containers/map/utils';
import { useSensorAddress } from '@/containers/monitoring/water-level/hooks/use-sensor-address';
import { isSensorOutsideArea } from '@/containers/monitoring/water-level/zones';

import { formatValueEUI } from '@/utils';

import { type Device } from '@/types';

interface Props {
  device: Device;
  resolution: number;
  isSelected: boolean;
  isEditing: boolean;
  isPlaced: boolean;
  onSelect: () => void;
  onEditingChange: (editing: boolean) => void;
}

export const SensorAreaCard = ({
  device,
  resolution,
  isSelected,
  isEditing,
  isPlaced,
  onSelect,
  onEditingChange,
}: Props) => {
  const t = useTranslations('monitoring');

  const checkpoint = device.device_properties?.latest_checkpoint;

  const coords = useMemo<[number, number] | null>(() => {
    const { latitude, longitude } = device.location ?? {};
    if (latitude !== undefined && longitude !== undefined)
      return [longitude, latitude];

    if (checkpoint) return [checkpoint.longitude, checkpoint.latitude];

    return null;
  }, [device.location, checkpoint]);

  const { address, isLoading: isLoadingAddress } = useSensorAddress(coords);

  const coverageArea = useMemo(
    () => Math.round(areaSquareMetres(device.cells)),
    [device.cells],
  );

  const cellCount = useMemo(
    () => areaCellCount(device.cells, resolution),
    [device.cells, resolution],
  );

  const hasStrandedArea = useMemo(
    () => isSensorOutsideArea(device, resolution),
    [device, resolution],
  );

  return (
    <div
      role='button'
      tabIndex={0}
      data-sensor-id={device.id}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onSelect();
      }}
      className={cn(
        'flex w-full cursor-pointer flex-col justify-center gap-y-3 rounded-xl border p-3 text-left transition-colors',
        isSelected
          ? 'border-brand-component-stroke-dark bg-brand-background-fill-surface'
          : 'border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost',
      )}
    >
      <div className='flex items-center gap-x-2'>
        <Fingerprint className='size-5 shrink-0 text-brand-component-text-dark' />
        <p className='min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-brand-component-text-dark'>
          <span className='text-brand-component-text-gray'>DevEUI:</span>{' '}
          {formatValueEUI(device.lorawan_device?.dev_eui ?? '')}
        </p>
        <div className='shrink-0' onClick={(event) => event.stopPropagation()}>
          <Switch
            aria-label={t('edit_area')}
            checked={isEditing}
            onCheckedChange={onEditingChange}
            thumbIcon={
              <Pen className='size-3 text-brand-component-text-dark' />
            }
          />
        </div>
      </div>
      {!hasStrandedArea && (
        <div className='flex items-center gap-x-3'>
          <div className='flex min-w-0 flex-1 flex-col justify-center gap-y-1'>
            <p className='text-xs font-medium leading-[18px] text-brand-component-text-gray'>
              {t('coverage_areas')}
            </p>
            <p className='truncate text-sm font-semibold leading-5 text-brand-component-text-dark'>
              {t('square_metres', { value: coverageArea.toLocaleString() })}
            </p>
          </div>
          <div className='flex min-w-0 flex-1 flex-col justify-center gap-y-1'>
            <p className='text-xs font-medium leading-[18px] text-brand-component-text-gray'>
              {t('selected_cells')}
            </p>
            <p className='truncate text-sm font-semibold leading-5 text-brand-component-text-dark'>
              {t('cell_count', { count: cellCount })}
            </p>
          </div>
        </div>
      )}
      {!!coords && (
        <div className='flex flex-col justify-center gap-y-1'>
          <p className='text-xs font-medium leading-[18px] text-brand-component-text-gray'>
            {t('sensor_location')}
          </p>
          {isLoadingAddress ? (
            <Skeleton className='h-5 w-full' />
          ) : (
            <p className='line-clamp-2 min-w-0 flex-1 text-sm font-semibold leading-5 text-brand-component-text-dark'>
              {address ?? t('address_unavailable')}
            </p>
          )}
        </div>
      )}

      {hasStrandedArea && (
        <div className='flex items-start gap-x-1 rounded-lg border border-brand-component-stroke-warning-soft bg-brand-component-fill-warning-soft p-2.5'>
          <Warning className='mt-0.5 size-4 shrink-0' />
          <p className='min-w-0 flex-1 break-words text-sm leading-5 text-brand-component-text-warning'>
            <span className='font-semibold'>
              {t('device_location_changed')}
            </span>
            <br />
            {t('monitoring_area_removed')}
          </p>
        </div>
      )}

      {!isEditing &&
        !isPlaced &&
        !device.device_properties?.latest_checkpoint &&
        !device.location && (
          <div className='w-full p-3 py-1 border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft text-center text-brand-component-text-gray font-semibold text-xs rounded-md'>
            {t('no_sensor_location')}
          </div>
        )}
    </div>
  );
};
