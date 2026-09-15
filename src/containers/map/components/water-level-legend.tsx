'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

const format = (value: number) =>
  Number.isFinite(value) ? String(value) : '—';

export interface WaterLevelLegendProps {
  thresholds: { safe: number; caution: number; warning: number };
  zoneColors: {
    safe: string;
    caution: string;
    warning: string;
    danger: string;
  };
  className?: string;
}

export const WaterLevelLegend = ({
  thresholds: { safe, caution, warning },
  zoneColors,
  className,
}: WaterLevelLegendProps) => {
  const t = useTranslations('monitoring');

  const bands = [
    {
      color: zoneColors.safe,
      text: t('legend_range_below', { max: format(safe), label: t('safe') }),
    },
    {
      color: zoneColors.caution,
      text: t('legend_range_between', {
        min: format(safe),
        max: format(caution),
        label: t('caution'),
      }),
    },
    {
      color: zoneColors.warning,
      text: t('legend_range_upto', {
        min: format(caution),
        max: format(warning),
        label: t('warning'),
      }),
    },
    {
      color: zoneColors.danger,
      text: t('legend_range_above', {
        max: format(warning),
        label: t('danger'),
      }),
    },
  ];

  return (
    <div
      className={cn(
        'w-52 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-1 shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]',
        className,
      )}
    >
      <p className='px-1.5 py-1 text-xs font-medium leading-[18px] text-brand-component-text-gray'>
        {t('water_level')}
      </p>
      {bands.map(({ color, text }) => (
        <div
          key={text}
          className='flex items-center gap-x-1.5 rounded-lg px-1.5 py-1'
        >
          <span
            className='size-4 shrink-0 rounded-full'
            style={{ backgroundColor: color }}
          />
          <p className='min-w-0 flex-1 truncate text-body font-medium text-brand-component-text-dark'>
            {text}
          </p>
        </div>
      ))}
    </div>
  );
};
