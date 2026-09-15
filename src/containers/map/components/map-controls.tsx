'use client';

import { CircleQuestionMark } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type DrawTool } from '@/containers/map/types';

type Control = { label: string; keys: string[] };

const Shortcut = ({ keys }: { keys: string[] }) => (
  <div className='flex shrink-0 items-center gap-x-1'>
    {keys.map((key) => (
      <span
        key={key}
        className='flex h-5 items-center justify-center whitespace-nowrap rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft px-2 text-xs font-medium leading-[18px] text-brand-component-text-gray'
      >
        {key}
      </span>
    ))}
  </div>
);

export type MapControlMode = 'view' | DrawTool;

interface Props {
  mode?: MapControlMode;
  className?: string;
}

export const MapControls = ({ mode = 'view', className }: Props) => {
  const t = useTranslations('monitoring');

  const relocate: Control = {
    label: t('control_relocate'),
    keys: [t('shortcut_rmb_click')],
  };
  const zoom: Control = {
    label: t('control_zoom'),
    keys: [t('shortcut_mouse_wheel')],
  };
  const rotate: Control = {
    label: t('control_rotate'),
    keys: [t('shortcut_rmb_drag')],
  };
  const dragToPan: Control = {
    label: t('control_pan_map'),
    keys: [t('shortcut_lmb_drag')],
  };
  const middleToPan = {
    label: t('control_pan_map'),
    keys: [t('shortcut_middle_mouse')],
  };

  const byMode: Record<MapControlMode, Control[]> = {
    view: [relocate, dragToPan, rotate, zoom],
    paint: [
      { label: t('control_toggle_cell'), keys: [t('shortcut_lmb_click')] },
      { label: t('control_paint_cells'), keys: [t('shortcut_lmb_drag')] },
      middleToPan,
      rotate,
      relocate,
      zoom,
    ],
    erase: [
      { label: t('control_erase_cell'), keys: [t('shortcut_lmb_click')] },
      { label: t('control_erase_multiple'), keys: [t('shortcut_lmb_drag')] },
      middleToPan,
      rotate,
      relocate,
      zoom,
    ],
    pan: [relocate, dragToPan, rotate, zoom],
  };

  const controls = byMode[mode];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='outline'
          aria-label={t('map_controls')}
          className={cn(
            'size-8 border border-brand-component-stroke-dark-soft',
            className,
          )}
        >
          <CircleQuestionMark className='text-brand-icon-dark' size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        side='top'
        className='w-auto rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-1 shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]'
      >
        <p className='px-1.5 py-1 text-xs font-medium leading-[18px] text-brand-component-text-gray'>
          {t('map_controls')}
        </p>
        {controls.map(({ label, keys }) => (
          <div
            key={label}
            className='flex items-center gap-x-1.5 rounded-lg px-1.5 py-1'
          >
            <p className='flex-1 whitespace-nowrap text-body font-medium text-brand-component-text-dark'>
              {label}
            </p>
            <Shortcut keys={keys} />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
