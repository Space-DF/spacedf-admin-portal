'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { InfoOutline, Waves } from '@/components/icons';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MeterInput } from '@/containers/map/components/meter-input';
import { SettingsAccordion } from '@/containers/monitoring/water-level/components/settings-accordion';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';

const THRESHOLDS = ['safe', 'caution', 'warning'] as const;

export const WaterThresholds = () => {
  const t = useTranslations('monitoring');
  const { control, trigger } = useFormContext<WaterLevelFormValues>();

  return (
    <SettingsAccordion
      value='water-thresholds'
      icon={<Waves width={20} height={20} className='shrink-0' />}
      title={t('default_water_thresholds')}
    >
      <div className='space-y-3'>
        <div className='flex gap-x-4'>
          {THRESHOLDS.map((threshold) => (
            <FormField
              key={threshold}
              control={control}
              name={`thresholds.${threshold}`}
              render={({ field: { onChange, ...field } }) => (
                <FormItem className='min-w-0 flex-1'>
                  <FormLabel>{t(threshold)}</FormLabel>
                  <FormControl>
                    <MeterInput
                      {...field}
                      min={0}
                      step={0.1}
                      onChange={(event) => {
                        onChange(event.target.valueAsNumber);
                        void trigger('thresholds');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <div className='flex font-medium text-xs items-center space-x-1 text-brand-component-text-gray'>
          <InfoOutline className='size-4 shrink-0' />
          <p>{t('danger_is_auto_applied')}</p>
        </div>
      </div>
    </SettingsAccordion>
  );
};
