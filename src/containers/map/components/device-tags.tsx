'use client';

import { Move } from 'lucide-react';
import { LngLat, Map as MapLibreMap } from 'maplibre-gl';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { columnHeight, UNSELECTED } from '@/containers/map/layers/water-level';
import { type WaterColumn } from '@/containers/map/types';
import { cellCenter, pointToCell } from '@/containers/map/utils';

const TAG_GAP_PX = 6;

const CULL_MARGIN_PX = 80;

type Elevation = NonNullable<
  Parameters<MapLibreMap['painter']['transform']['locationToScreenPoint']>[1]
>;

const flatElevation = (metres: number) =>
  ({
    getElevationForLngLat: () => metres,
    getElevationForLngLatZoom: () => metres,
  }) as unknown as Elevation;

type Drag = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
  from: string;
  cell: string;
  at: [number, number] | null;
};

interface Props {
  map: MapLibreMap;
  columns: WaterColumn[];
  onColumn: boolean;
  resolution: number;
  editingId?: string | null;
  selectedId?: string | null;
  onMove?: (location: [number, number]) => void;
  onMoveEnd?: (location: [number, number]) => void;
  onSelect?: (id: string) => void;
}

export const DeviceTags = ({
  map,
  columns,
  onColumn,
  resolution,
  editingId,
  selectedId,
  onMove,
  onMoveEnd,
  onSelect,
}: Props) => {
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<Drag | null>(null);

  const positions = useMemo(
    () => columns.map(({ h3 }) => new LngLat(...cellCenter(h3))),
    [columns],
  );

  const elevation = useMemo(
    () => flatElevation(onColumn ? columnHeight(resolution) : 0),
    [onColumn, resolution],
  );

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, h3: string) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);

      const { left, top } = map.getContainer().getBoundingClientRect();
      // The tag floats above its column; the device stands at ground level.
      const ground = map.project(cellCenter(h3));

      dragRef.current = {
        pointerId: event.pointerId,
        offsetX: event.clientX - left - ground.x,
        offsetY: event.clientY - top - ground.y,
        from: h3,
        cell: h3,
        at: null,
      };
    },
    [map],
  );

  const drag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const held = dragRef.current;
      if (held?.pointerId !== event.pointerId) return;

      const { left, top } = map.getContainer().getBoundingClientRect();
      const { lng, lat } = map.unproject([
        event.clientX - left - held.offsetX,
        event.clientY - top - held.offsetY,
      ]);
      const cell = pointToCell(lng, lat, resolution);
      if (cell === held.cell) return;
      held.cell = cell;
      held.at = [lng, lat];
      onMove?.(held.at);
    },
    [map, onMove, resolution],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const held = dragRef.current;
      // The browser hands the capture back on its own once the pointer is up.
      if (held?.pointerId !== event.pointerId) return;
      dragRef.current = null;
      if (held.at && held.cell !== held.from) onMoveEnd?.(held.at);
    },
    [onMoveEnd],
  );

  useEffect(() => {
    const container = map.getContainer();

    const reposition = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      positions.forEach((position, index) => {
        const tag = tagRefs.current[index];
        if (!tag) return;

        const { x, y } = map.painter.transform.locationToScreenPoint(
          position,
          elevation,
        );
        const offscreen =
          x < -CULL_MARGIN_PX ||
          y < -CULL_MARGIN_PX ||
          x > width + CULL_MARGIN_PX ||
          y > height + CULL_MARGIN_PX;

        tag.style.visibility = offscreen ? 'hidden' : 'visible';
        tag.style.transform = `translate(${x}px, ${y - TAG_GAP_PX}px) translate(-50%, -100%)`;
      });
    };

    reposition();
    map.on('render', reposition);
    return () => {
      map.off('render', reposition);
    };
  }, [map, positions, elevation]);

  return (
    <div className='pointer-events-none absolute inset-0 z-[4] overflow-hidden'>
      {columns.map((column, index) => {
        const isEditing = !!editingId && column.id === editingId;

        const dimmed = !!selectedId && column.id !== selectedId;

        const { id } = column;
        /** A tag being dragged is not a tag being clicked. */
        const pick = !isEditing && id && onSelect ? () => onSelect(id) : null;

        return (
          <div
            key={column.id ?? column.h3}
            ref={(element) => {
              tagRefs.current[index] = element;
            }}
            style={dimmed ? { opacity: UNSELECTED } : undefined}
            className={cn(
              'absolute left-0 top-0 invisible will-change-transform',
              isEditing &&
                'pointer-events-auto cursor-grab touch-none active:cursor-grabbing',
              pick && 'pointer-events-auto cursor-pointer',
            )}
            onClick={pick ?? undefined}
            onPointerDown={
              isEditing ? (event) => startDrag(event, column.h3) : undefined
            }
            onPointerMove={isEditing ? drag : undefined}
            onPointerUp={isEditing ? endDrag : undefined}
            onPointerCancel={isEditing ? endDrag : undefined}
          >
            <DeviceTag
              image={column.image}
              name={column.name}
              isEditing={isEditing}
            />
          </div>
        );
      })}
    </div>
  );
};

const DeviceTag = ({
  image,
  name,
  isEditing,
}: Pick<WaterColumn, 'image' | 'name'> & { isEditing?: boolean }) => {
  const t = useTranslations('monitoring');

  return (
    <div
      className={cn(
        'flex size-9 items-center relative justify-center rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-1.5 shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]',
        isEditing &&
          'border-2 border-brand-component-stroke-info ring-2 ring-[color:color-mix(in_srgb,hsl(var(--component-stroke-info))_40%,transparent)]',
      )}
    >
      <Image
        src={image}
        alt={name ?? ''}
        width={24}
        height={24}
        className='size-6 object-contain'
      />
      {isEditing && (
        <div className='absolute left-1/2 -translate-x-1/2 -top-8 text-brand-icon-gray'>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-6 rounded-md'
                >
                  <Move size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top'>
                {t('monitoring_area_moves_with_sensor')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};
