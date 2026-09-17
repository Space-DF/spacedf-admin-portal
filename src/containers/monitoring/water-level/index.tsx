'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { InfoOutline } from '@/components/icons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CellSizeSelect } from '@/containers/map/components/cell-size-select';
import { DisplayToggle } from '@/containers/monitoring/water-level/components/display-toggle';
import { MonitoringAreas } from '@/containers/monitoring/water-level/components/monitoring-areas';
import { UnsavedAreaDialog } from '@/containers/monitoring/water-level/components/unsaved-area-dialog';
import { WaterLevelActions } from '@/containers/monitoring/water-level/components/water-level-actions';
import { WaterLevelMap } from '@/containers/monitoring/water-level/components/water-level-map';
import { WaterThresholds } from '@/containers/monitoring/water-level/components/water-thresholds';
import { ZoneColors } from '@/containers/monitoring/water-level/components/zone-colors';
import {
  useGetWaterLevelSetting,
  useUpdateMonitoringSetting,
} from '@/containers/monitoring/water-level/hooks/use-monitoring-settings';
import { WaterLevelSensorsProvider } from '@/containers/monitoring/water-level/hooks/use-water-level-sensors';
import {
  DEFAULT_WATER_LEVEL,
  type WaterLevelFormValues,
  waterLevelSchema,
} from '@/containers/monitoring/water-level/schema';
import {
  toMonitoringPayload,
  toWaterLevelFormValues,
} from '@/containers/monitoring/water-level/utils';

const MAP_CENTER: [number, number] = [108.24984896028751, 15.99490480737102];

const MAP_ZOOM = 15;
const MAP_PITCH = 30;
const MAP_BEARING = -18;

const TAB_TRIGGER_CLASS =
  'h-full rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-semibold leading-5 text-brand-component-text-dark shadow-none transition-colors data-[state=active]:border-brand-component-stroke-dark data-[state=active]:bg-transparent data-[state=active]:text-brand-component-text-dark';

type WaterLevelTab = 'general' | 'monitoring-areas';

const WaterLevel = () => {
  const t = useTranslations('monitoring');

  const [tab, setTab] = useState<WaterLevelTab>('general');

  const { data: setting } = useGetWaterLevelSetting();
  const { mutate: updateSetting, isPending: isSaving } =
    useUpdateMonitoringSetting();

  const values = useMemo(
    () => (setting ? toWaterLevelFormValues(setting) : undefined),
    [setting],
  );

  const form = useForm<WaterLevelFormValues>({
    resolver: zodResolver(waterLevelSchema),
    defaultValues: DEFAULT_WATER_LEVEL,
    values,
    resetOptions: { keepDirtyValues: true },
    mode: 'onChange',
  });

  const {
    control,
    reset,
    formState: { isDirty },
  } = form;

  const handleDiscard = () => reset();

  const handleSave = form.handleSubmit((formValues) => {
    console.log({ setting });
    if (!setting) return;
    updateSetting(
      { id: setting.id, data: toMonitoringPayload(formValues) },
      { onSuccess: () => reset(formValues) },
    );
  });

  return (
    <Form {...form}>
      <WaterLevelSensorsProvider>
        <div className='-mx-10 -mt-6 flex h-dvh overflow-hidden bg-brand-background-fill-surface'>
          <div className='z-10 grid h-full w-full shrink-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-r border-brand-component-stroke-dark-soft bg-background md:w-96 lg:w-[383px]'>
            <div className='flex flex-col justify-center gap-y-0.5 border-b border-brand-component-stroke-dark-soft p-4'>
              <h1 className='text-[16px] font-semibold leading-6 text-brand-component-text-dark'>
                {t('water_level')}
              </h1>
              <p className='text-xs font-normal leading-[18px] text-brand-component-text-gray'>
                {t('water_level_subtitle')}
              </p>
            </div>
            <Tabs
              value={tab}
              onValueChange={(next) => setTab(next as WaterLevelTab)}
              className='grid min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden'
            >
              <TabsList className='grid h-11 w-full grid-cols-2 rounded-none border-b border-brand-component-stroke-dark-soft bg-transparent p-0'>
                <TabsTrigger value='general' className={TAB_TRIGGER_CLASS}>
                  {t('general')}
                </TabsTrigger>
                <TabsTrigger
                  value='monitoring-areas'
                  className={TAB_TRIGGER_CLASS}
                >
                  {t('monitoring_areas')}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value='general'
                className='mt-0 min-h-0 grid-rows-[minmax(0,1fr)_auto] overflow-hidden data-[state=active]:grid'
              >
                <div className='flex flex-col gap-y-6 overflow-y-auto px-4 pt-3'>
                  <div className='flex flex-col gap-y-4'>
                    <FormField
                      control={control}
                      name='cellResolution'
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <div className='flex items-center gap-x-1.5'>
                            <FormLabel>{t('cell_size')}</FormLabel>
                            <TooltipProvider delayDuration={0}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type='button'
                                    className='flex cursor-pointer items-center justify-center rounded-md p-0.5 outline-none transition-colors hover:bg-brand-component-fill-dark-soft/50'
                                  >
                                    <InfoOutline className='size-3.5 shrink-0 text-brand-component-text-gray' />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent className='max-w-64 leading-relaxed'>
                                  {t('cell_size_hint')}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <FormControl>
                            <CellSizeSelect value={value} onChange={onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <WaterThresholds />
                    <ZoneColors />
                  </div>
                  <div
                    role='separator'
                    className='w-full shrink-0 border-t border-dashed border-brand-component-stroke-dark-soft'
                  />

                  <div className='flex flex-col gap-y-4'>
                    <div className='flex flex-col gap-y-1'>
                      <h2 className='text-[16px] font-semibold leading-6 text-brand-component-text-dark'>
                        {t('display')}
                      </h2>
                      <p className='text-body font-normal text-brand-component-text-gray'>
                        {t('display_subtitle')}
                      </p>
                    </div>
                    <DisplayToggle
                      control={control}
                      name='display.waterColumn'
                      label={t('water_column')}
                      description={t('water_column_subtitle')}
                    />
                    <DisplayToggle
                      control={control}
                      name='display.coverage'
                      label={t('coverage')}
                      description={t('coverage_subtitle')}
                    />
                  </div>
                </div>
                <WaterLevelActions
                  onDiscard={handleDiscard}
                  onSave={handleSave}
                  isDirty={isDirty}
                  isSaving={isSaving}
                />
              </TabsContent>
              <TabsContent
                value='monitoring-areas'
                className='mt-0 min-h-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden data-[state=active]:grid'
              >
                <MonitoringAreas />
              </TabsContent>
            </Tabs>
          </div>
          <WaterLevelMap
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            pitch={MAP_PITCH}
            bearing={MAP_BEARING}
            dataMode={tab === 'monitoring-areas' ? 'real' : 'preview'}
          />
        </div>
        <UnsavedAreaDialog />
      </WaterLevelSensorsProvider>
    </Form>
  );
};

export default WaterLevel;
