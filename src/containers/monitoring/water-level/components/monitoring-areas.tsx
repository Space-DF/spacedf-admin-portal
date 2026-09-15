'use client';

import { ListFilter, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useInView } from 'react-intersection-observer';

import { InputWithIcon } from '@/components/ui/input';
import { Nodata } from '@/components/ui/no-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SensorAreaCard } from '@/containers/monitoring/water-level/components/sensor-area-card';
import {
  type SensorStatus,
  STATUS_OPTIONS,
  useWaterLevelSensors,
} from '@/containers/monitoring/water-level/hooks/use-water-level-sensors';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';

const STATUS_LABEL_KEY: Record<SensorStatus, string> = {
  all: 'all_status',
  no_location: 'status_no_location',
  has_location: 'status_has_location',
};

export const MonitoringAreas = () => {
  const t = useTranslations('monitoring');

  const { control } = useFormContext<WaterLevelFormValues>();
  const resolution = useWatch({ control, name: 'cellResolution' });

  const {
    sensors,
    isLoading,
    hasMoreSensors,
    loadMoreSensors,
    search,
    setSearch,
    status,
    setStatus,
    selectedId,
    selectSensor,
    editingId,
    editSensor,
    movedLocations,
  } = useWaterLevelSensors();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView) loadMoreSensors();
  }, [inView, loadMoreSensors]);

  const listRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      shownRef.current = null;
      return;
    }
    if (shownRef.current === selectedId) return;

    const card = listRef.current?.querySelector(
      `[data-sensor-id="${CSS.escape(selectedId)}"]`,
    );
    if (!card) {
      shownRef.current = null;
      return;
    }

    shownRef.current = selectedId;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId, sensors]);

  return (
    <>
      <div className='flex flex-col gap-y-1 border-b border-dashed border-brand-component-stroke-dark-soft p-4'>
        <h2 className='text-[16px] font-semibold leading-6 text-brand-component-text-dark'>
          {t('monitoring_areas')}
        </h2>
        <p className='text-sm font-normal leading-5 text-brand-component-text-gray'>
          {t('monitoring_areas_subtitle')}
        </p>
      </div>

      <div
        ref={listRef}
        className='flex flex-col gap-y-4 overflow-y-auto px-4 pt-3'
      >
        <div className='flex shrink-0 items-center gap-x-3'>
          <InputWithIcon
            prefixCpn={<Search size={16} />}
            placeholder={t('search_sensors')}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            wrapperClass='min-w-0 flex-1'
            className='border-brand-component-stroke-dark-soft font-medium'
          />
          <Select
            value={status}
            onValueChange={(next: SensorStatus) => setStatus(next)}
          >
            <SelectTrigger className='h-9 w-36 shrink-0 justify-start gap-2 rounded-xl border-brand-component-stroke-dark-soft px-3 font-medium [&>span]:min-w-0 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left'>
              <ListFilter className='size-4 shrink-0 text-brand-component-text-dark' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {t(STATUS_LABEL_KEY[option])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className='flex flex-col gap-y-4'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className='h-28 w-full rounded-xl' />
            ))}
          </div>
        ) : sensors.length ? (
          <div className='flex flex-col gap-y-4'>
            {sensors.map((device) => (
              <SensorAreaCard
                key={device.id}
                device={device}
                resolution={resolution}
                isSelected={device.id === selectedId}
                isEditing={device.id === editingId}
                isPlaced={device.id in movedLocations}
                onSelect={() =>
                  selectSensor(device.id === selectedId ? null : device.id)
                }
                onEditingChange={(editing) =>
                  editSensor(editing ? device.id : null)
                }
              />
            ))}

            {hasMoreSensors && (
              <div ref={loadMoreRef} className='flex flex-col gap-y-4'>
                {Array.from({ length: 2 }).map((_, index) => (
                  <Skeleton key={index} className='h-28 w-full rounded-xl' />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Nodata iconHeight={96} iconWidth={96} content={t('no_sensors')} />
        )}
      </div>
    </>
  );
};
