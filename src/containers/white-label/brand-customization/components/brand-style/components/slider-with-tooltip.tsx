'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { Controller, useFormContext } from 'react-hook-form';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';

interface SliderWithTooltipProps {
  label: string;
  description: string;
  valueKey: 'buttonBorderRadius' | 'inputBorderRadius' | 'cardBorderRadius';
  min?: number;
  max?: number;
}

const SliderWithTooltip = ({
  label,
  description,
  valueKey,
  min = 0,
  max = 24,
}: SliderWithTooltipProps) => {
  const { control } = useFormContext<BrandCustomizationFormValues>();

  return (
    <div className='space-y-2'>
      <div className='space-y-0.5'>
        <label className='text-[16px] font-semibold text-brand-component-text-dark'>
          {label}
        </label>
        <p className='text-xs text-brand-component-text-gray font-normal leading-normal'>
          {description}
        </p>
      </div>

      <Controller
        control={control}
        name={`style.${valueKey}`}
        render={({ field: { value, onChange } }) => (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <SliderPrimitive.Root
                className='relative flex w-full touch-none select-none items-center pt-2 cursor-pointer'
                min={min}
                max={max}
                step={1}
                value={[value ?? 0]}
                onValueChange={(vals) => onChange(vals[0])}
              >
                <SliderPrimitive.Track className='relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20'>
                  <SliderPrimitive.Range className='absolute h-full bg-primary' />
                </SliderPrimitive.Track>
                <TooltipTrigger asChild>
                  <SliderPrimitive.Thumb className='block h-4 w-4 rounded-full border bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing' />
                </TooltipTrigger>
              </SliderPrimitive.Root>
              <TooltipContent
                side='top'
                className='px-2.5 py-1 bg-[#171A28] border-none text-white text-[11px] font-bold rounded shadow-md'
              >
                {value}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      />
    </div>
  );
};

export default SliderWithTooltip;
