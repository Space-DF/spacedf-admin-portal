'use client';

import { Move } from 'lucide-react';
import { type Map as MapLibreMap, type MapMouseEvent } from 'maplibre-gl';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Spot = { x: number; y: number; at: [number, number] };

interface Props {
  map: MapLibreMap;
  onRelocate: (location: [number, number]) => void;
}

export const MapContextMenu = ({ map, onRelocate }: Props) => {
  const t = useTranslations('monitoring');
  const [spot, setSpot] = useState<Spot | null>(null);

  useEffect(() => {
    const open = ({ point, lngLat }: MapMouseEvent) =>
      setSpot({ x: point.x, y: point.y, at: [lngLat.lng, lngLat.lat] });

    /** The menu points at a place, which a camera move slides out from under it. */
    const close = () => setSpot(null);

    map.on('contextmenu', open);
    map.on('movestart', close);

    return () => {
      map.off('contextmenu', open);
      map.off('movestart', close);
    };
  }, [map]);

  const relocate = useCallback(() => {
    if (spot) onRelocate(spot.at);
  }, [spot, onRelocate]);

  return (
    <DropdownMenu
      modal={false}
      open={!!spot}
      onOpenChange={(open) => {
        if (!open) setSpot(null);
      }}
    >
      <DropdownMenuTrigger
        aria-hidden
        tabIndex={-1}
        className='absolute size-0'
        style={{ left: spot?.x ?? 0, top: spot?.y ?? 0 }}
      />
      <DropdownMenuContent
        align='start'
        sideOffset={2}
        className='w-auto rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-1 shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]'
      >
        <DropdownMenuItem
          onSelect={relocate}
          className='cursor-pointer gap-1.5 rounded-lg px-1.5 py-1 text-brand-component-text-dark'
        >
          <Move size={16} className='shrink-0' />
          <span className='flex-1 whitespace-nowrap text-sm font-medium leading-5'>
            {t('relocate_sensor')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
