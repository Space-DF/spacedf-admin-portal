'use client';

import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

interface Props extends React.ComponentPropsWithoutRef<
  typeof LabelPrimitive.Root
> {
  isRequired?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  Props & VariantProps<typeof labelVariants>
>(({ className, isRequired, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'text-brand-text-gray dark:text-brand-dark-text-gray',
      labelVariants(),
      className,
    )}
    {...props}
  >
    {props.children}
    {isRequired && (
      <span className='text-xs font-semibold text-brand-component-text-accent ml-1'>
        *
      </span>
    )}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
