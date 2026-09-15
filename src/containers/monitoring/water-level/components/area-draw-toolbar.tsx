'use client';

import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  ArrowsOutCardinal,
  ArrowUUpLeft,
  Brush,
  Eraser,
  Hexagon,
  MapTrifold,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type DrawTool } from '@/containers/map/types';

interface StatProps {
  icon: ReactNode;
  value: string;
  label: string;
  className?: string;
}

const Stat = ({ icon, value, label, className }: StatProps) => (
  <div className={cn('flex items-center gap-x-1.5 py-1', className)}>
    <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-component-fill-secondary-soft text-brand-icon-secondary'>
      {icon}
    </span>
    <div className='flex flex-col items-start'>
      <p className='whitespace-nowrap text-sm font-semibold leading-5 text-brand-component-text-dark'>
        {value}
      </p>
      <p className='whitespace-nowrap text-xs font-medium leading-[18px] text-brand-component-text-gray'>
        {label}
      </p>
    </div>
  </div>
);

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  tooltip: string;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton = ({
  icon,
  label,
  tooltip,
  isActive,
  onClick,
}: ToolButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type='button'
        size='icon'
        variant='ghost'
        aria-label={label}
        aria-pressed={isActive}
        onClick={onClick}
        className={cn(
          'shrink-0 text-brand-component-text-dark',
          isActive &&
            'bg-brand-component-fill-dark text-brand-component-text-light shadow hover:bg-brand-component-fill-dark hover:text-brand-component-text-light',
        )}
      >
        {icon}
      </Button>
    </TooltipTrigger>
    <TooltipContent side='top'>{tooltip}</TooltipContent>
  </Tooltip>
);

interface Props {
  cellCount: number;
  coverageArea: number;
  tool: DrawTool;
  onToolChange: (tool: DrawTool) => void;
  onUndo: () => void;
  canUndo: boolean;
  className?: string;
}

export const AreaDrawToolbar = ({
  cellCount,
  coverageArea,
  tool,
  onToolChange,
  onUndo,
  canUndo,
  className,
}: Props) => {
  const t = useTranslations('monitoring');

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex items-center gap-x-0 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-1 drop-shadow-[0px_8px_5px_rgba(0,0,0,0.06)]',
          className,
        )}
      >
        <Stat
          className='pl-1 pr-4'
          icon={<Hexagon className='size-5' />}
          value={cellCount.toLocaleString()}
          label={t('cells_selected')}
        />
        <Separator
          orientation='vertical'
          className='h-6 bg-brand-component-stroke-dark-soft'
        />
        <Stat
          className='px-4'
          icon={<MapTrifold className='size-5' />}
          value={t('square_metres', {
            value: Math.round(coverageArea).toLocaleString(),
          })}
          label={t('coverage_area')}
        />
        <Separator
          orientation='vertical'
          className='h-6 bg-brand-component-stroke-dark-soft'
        />

        <div className='flex items-center gap-x-1 py-1 pl-4 pr-1'>
          <Button
            type='button'
            variant='outline'
            disabled={!canUndo}
            onClick={onUndo}
            prefixCpn={<ArrowUUpLeft className='size-5' />}
            className='border-brand-component-stroke-dark-soft bg-brand-component-fill-light font-semibold text-brand-component-text-dark shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]'
          >
            {t('undo')}
          </Button>
          <ToolButton
            icon={<Brush className='size-5' />}
            label={t('control_paint_cells')}
            tooltip={t('tool_draw')}
            isActive={tool === 'paint'}
            onClick={() => onToolChange('paint')}
          />
          <ToolButton
            icon={<Eraser className='size-5' />}
            label={t('control_erase_cells')}
            tooltip={t('tool_erase')}
            isActive={tool === 'erase'}
            onClick={() => onToolChange('erase')}
          />
          <ToolButton
            icon={<ArrowsOutCardinal className='size-5' />}
            label={t('control_pan_map')}
            tooltip={t('tool_move')}
            isActive={tool === 'pan'}
            onClick={() => onToolChange('pan')}
          />
        </div>
      </div>
    </TooltipProvider>
  );
};
