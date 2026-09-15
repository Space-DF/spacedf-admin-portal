'use client';

import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import SelectColor from '@/components/common/select-color';
import { PaintBrush } from '@/components/icons';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SettingsAccordion } from '@/containers/monitoring/water-level/components/settings-accordion';
import { type WaterLevelFormValues } from '@/containers/monitoring/water-level/schema';

const ZONE_COLORS = ['safe', 'caution', 'warning', 'danger'] as const;

export const ZoneColors = () => {
  const t = useTranslations('monitoring');
  const { control } = useFormContext<WaterLevelFormValues>();

  return (
    <SettingsAccordion
      value='zone-color'
      icon={<PaintBrush />}
      title={t('default_zone_color')}
      description={t('customize_zone_color_subtitle')}
    >
      <div className='grid grid-cols-2 gap-4'>
        {ZONE_COLORS.map((zone) => (
          <FormField
            key={zone}
            control={control}
            name={`zoneColors.${zone}`}
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>{t(zone)}</FormLabel>
                <FormControl>
                  <SelectColor
                    fieldValue={value.replace('#', '')}
                    onValueChange={(color) => onChange(`#${color}`)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </SettingsAccordion>
  );
};
