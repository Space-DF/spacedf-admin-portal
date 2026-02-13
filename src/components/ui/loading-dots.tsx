import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  dotClassName?: string;
}

export const LoadingDots = ({
  dotClassName = 'bg-white',
}: LoadingDotsProps) => {
  return (
    <div className='flex items-center gap-1'>
      <span
        className={cn(
          'h-2 w-2 animate-loading-blink rounded-full delay-300',
          dotClassName,
        )}
      />
      <span
        className={cn(
          'h-2 w-2 animate-loading-blink rounded-full delay-500',
          dotClassName,
        )}
      />
      <span
        className={cn(
          'h-2 w-2 animate-loading-blink rounded-full delay-700',
          dotClassName,
        )}
      />
    </div>
  );
};
