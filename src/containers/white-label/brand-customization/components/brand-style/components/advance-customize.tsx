'use client';

import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';

import SelectColor from '@/components/common/select-color';
import { PaintBrush } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';

interface ColorPickerItemProps {
  label: string;
  colorKey:
    | 'primary'
    | 'primary_text'
    | 'secondary'
    | 'secondary_text'
    | 'accent'
    | 'accent_text'
    | 'background'
    | 'border'
    | 'text'
    | 'support_text'
    | 'card'
    | 'switch_background'
    | 'input'
    | 'input_border';
}

const ColorPickerItem = memo(({ label, colorKey }: ColorPickerItemProps) => {
  const { watch, setValue } = useFormContext<BrandCustomizationFormValues>();
  const theme = useBrandStore((state) => state.theme);

  const isLightMode = theme === 'light';

  const color =
    watch(
      isLightMode
        ? `style.lightColors.${colorKey}`
        : `style.darkColors.${colorKey}`,
    ) || '#FFFFFF';

  const cleanHex = (c: string) => {
    if (!c) return 'FFFFFF';
    return c.replace('#', '').toUpperCase();
  };

  const formatHex = (c: string) => {
    if (!c) return '#FFFFFF';
    return c.startsWith('#') ? c : `#${c}`;
  };

  return (
    <div className='space-y-1.5'>
      <label className='text-xs font-semibold text-brand-component-text-dark'>
        {label}
      </label>
      <SelectColor
        fieldValue={cleanHex(color)}
        onValueChange={(val) => {
          setValue(
            isLightMode
              ? `style.lightColors.${colorKey}`
              : `style.darkColors.${colorKey}`,
            formatHex(val),
            { shouldDirty: true, shouldValidate: true },
          );
        }}
      />
    </div>
  );
});

ColorPickerItem.displayName = 'ColorPickerItem';

export const AdvanceCustomize = () => {
  const t = useTranslations('white-label');

  return (
    <Accordion
      type='single'
      collapsible
      className='max-w-lg rounded-lg border border-brand-component-stroke-dark-soft'
      defaultValue=''
    >
      <AccordionItem value='advanced' className='border-b px-3 last:border-b-0'>
        <AccordionTrigger className='hover:no-underline py-3'>
          <div className='space-y-1 flex flex-col'>
            <div className='flex items-center space-x-2'>
              <PaintBrush />
              <span className='text-brand-component-text-dark font-semibold text-body'>
                {t('advanced_customization')}
              </span>
            </div>
            <span className='text-brand-component-text-gray text-body font-normal text-left'>
              {t('customize_every_color_hint')}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className='grid grid-cols-2 gap-x-4 gap-y-3 pt-2 pb-1'>
            <ColorPickerItem label={t('primary')} colorKey='primary' />
            <ColorPickerItem
              label={t('primary_text_icon')}
              colorKey='primary_text'
            />
            <ColorPickerItem label={t('secondary')} colorKey='secondary' />
            <ColorPickerItem
              label={t('secondary_text_icon')}
              colorKey='secondary_text'
            />
            <ColorPickerItem label={t('accent')} colorKey='accent' />
            <ColorPickerItem
              label={t('accent_text_icon')}
              colorKey='accent_text'
            />
            <ColorPickerItem label={t('background')} colorKey='background' />
            <ColorPickerItem label={t('border')} colorKey='border' />
            <ColorPickerItem label={t('default_text_icon')} colorKey='text' />
            <ColorPickerItem
              label={t('support_text_icon')}
              colorKey='support_text'
            />
            <ColorPickerItem label={t('card')} colorKey='card' />
            <ColorPickerItem
              label={t('switch_background')}
              colorKey='switch_background'
            />
            <ColorPickerItem label={t('input_background')} colorKey='input' />
            <ColorPickerItem
              label={t('default_input_border')}
              colorKey='input_border'
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
