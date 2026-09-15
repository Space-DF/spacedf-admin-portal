import { useTranslations } from 'next-intl';
import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Input, type InputProps } from '@/components/ui/input';

export const MeterInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const t = useTranslations('common');

    return (
      <div className='relative w-full'>
        <Input
          ref={ref}
          type='number'
          inputMode='decimal'
          className={cn('rounded-xl pr-8 font-medium', className)}
          {...props}
        />
        <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-body font-medium text-brand-component-text-gray'>
          {t('meter_unit')}
        </span>
      </div>
    );
  },
);

MeterInput.displayName = 'MeterInput';
