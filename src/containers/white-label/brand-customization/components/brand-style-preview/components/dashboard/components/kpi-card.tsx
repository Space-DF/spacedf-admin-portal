import { ReactNode } from 'react';

interface KpiCardProps {
  title: ReactNode;
  value: string;
  unit?: string;
}

export const KpiCard = ({ title, value, unit }: KpiCardProps) => {
  return (
    <div className='border p-4 flex flex-col justify-between transition-all duration-300 min-h-[96px] bg-[--widget-card-color] border-[--widget-border-color] rounded-[--card-border-radius]'>
      <div className='text-[11px] font-semibold tracking-tight text-[--text-color]'>
        {title}
      </div>
      <div className='flex items-baseline gap-0.5 mt-auto'>
        <span className='text-2xl font-bold tracking-tight leading-none text-[--text-color]'>
          {value}
        </span>
        {unit && (
          <span className='text-[9px] font-semibold ml-0.5 text-[--support-text-color]'>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
