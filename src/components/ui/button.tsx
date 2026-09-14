import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'text-body inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary dark:bg-brand-dark-fill-secondary dark:text-white hover:dark:bg-opacity-80 text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-brand-component-fill-negative text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-brand-component-text-dark shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        destructiveOutline:
          'border border-destructive text-destructive shadow-sm hover:bg-destructive/90 hover:text-white',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-xl',
        sm: 'h-8 rounded-[10px] px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-14 rounded-lg px-5 py-4',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  size?: 'sm' | 'lg' | 'xl' | 'icon';
  prefixCpn?: React.ReactNode;
  suffixCpn?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      children,
      prefixCpn,
      suffixCpn,
      disabled,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const spinner = <LoaderCircle className='size-4 shrink-0 animate-spin' />;

    const prefixNode = loading ? spinner : prefixCpn;
    const hasAffix = !!prefixNode || !!suffixCpn;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          hasAffix && 'gap-2',
        )}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {prefixNode}
        <Slottable>{children}</Slottable>
        {suffixCpn}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
