'use client';

import { Map } from 'maplibre-gl';
import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { DataModeBadge } from '@/containers/map/components/data-mode-badge';
import { SearchLocation } from '@/containers/map/components/search-location';

interface Props {
  className?: string;
  isRealData: boolean;
  map: Map | null;
  actions?: ReactNode;
}

export const MapHeader = ({ className, isRealData, map, actions }: Props) => {
  return (
    <div
      className={cn(
        'pointer-events-none grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-x-3 px-3 py-7 [&_a]:pointer-events-auto [&_button]:pointer-events-auto',
        className,
      )}
    >
      <DataModeBadge
        isRealData={isRealData}
        className='col-start-1 justify-self-start'
      />
      {isRealData && (
        <SearchLocation map={map} className='col-start-2 min-w-0' />
      )}
      <div className='col-start-3 justify-self-end'>{actions}</div>
    </div>
  );
};
