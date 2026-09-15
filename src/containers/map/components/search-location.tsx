'use client';

import { type GeocodingFeature } from '@maptiler/client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Search } from 'lucide-react';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { useLocale, useTranslations } from 'next-intl';
import { type ChangeEvent, useCallback, useState } from 'react';

import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { InputWithIcon } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';

import { GEOCODING_FORWARD_QUERY_KEY } from '@/constants/query-keys';
import { geocodingService } from '@/utils/map-geocoding';

/** How many suggestions the list shows. MapTiler caps `limit` at 10. */
const RESULT_LIMIT = 8;
const SEARCH_DEBOUNCE_MS = 300;
const RESULT_ZOOM = 14;

interface Props {
  map: MapLibreMap | null;
  className?: string;
}

const isPoint = (value: unknown): value is [number, number] =>
  Array.isArray(value) &&
  typeof value[0] === 'number' &&
  typeof value[1] === 'number';

const getCenter = (feature: GeocodingFeature): [number, number] | null => {
  if (isPoint(feature.center)) return [feature.center[0], feature.center[1]];

  const geometry = feature.geometry;
  if (geometry?.type === 'Point' && isPoint(geometry.coordinates)) {
    return [geometry.coordinates[0], geometry.coordinates[1]];
  }

  return null;
};

export const SearchLocation = ({ map, className }: Props) => {
  const t = useTranslations('monitoring');
  const locale = useLocale();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const term = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);

  const { data: results = [], isFetching } = useQuery({
    queryKey: [...GEOCODING_FORWARD_QUERY_KEY, term, locale],
    queryFn: () => {
      const center = map?.getCenter();

      return geocodingService.forward(term, {
        limit: RESULT_LIMIT,
        language: locale,
        proximity: center ? [center.lng, center.lat] : undefined,
      });
    },
    enabled: !!term,
    staleTime: 5 * 60 * 1000,
  });

  /** The debounce still owes us a search, so the list is not empty yet. */
  const loading = isFetching || query.trim() !== term;

  const handleSelect = useCallback(
    (feature: GeocodingFeature) => {
      const center = getCenter(feature);
      if (map && center) {
        // The camera keeps its tilt: only where it looks is being answered here.
        map.flyTo({
          center,
          zoom: RESULT_ZOOM,
          duration: 800,
          pitch: map.getPitch(),
        });
      }
      setQuery(feature.place_name);
      setOpen(false);
    },
    [map],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setOpen(Boolean(value.trim()));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          className={cn('pointer-events-auto z-10 w-72 max-w-full', className)}
        >
          <InputWithIcon
            type='text'
            value={query}
            onChange={handleChange}
            onFocus={() => setOpen(Boolean(query.trim()))}
            placeholder={t('search_location')}
            prefixCpn={<Search size={16} />}
            wrapperClass='w-full'
            className='rounded-[10px] border-brand-component-stroke-dark-soft font-medium shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]'
            aria-label={t('search_location')}
            aria-autocomplete='list'
            aria-controls='search-location-list'
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        id='search-location-list'
        align='start'
        sideOffset={6}
        className='w-[var(--radix-popover-trigger-width)] rounded-[10px] border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-0 shadow-[0px_8px_5px_0px_rgba(0,0,0,0.06)]'
        // Focus belongs to the input, or the next keystroke would be lost.
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false} className='rounded-[10px] border-0'>
          <CommandList>
            {loading ? (
              <p className='py-4 text-center text-sm text-brand-component-text-gray'>
                {t('searching')}
              </p>
            ) : results.length ? (
              <CommandGroup>
                {results.map((feature) => {
                  const center = getCenter(feature);

                  return (
                    <CommandItem
                      key={feature.id}
                      value={feature.id}
                      onSelect={() => handleSelect(feature)}
                      disabled={!center}
                      className='cursor-pointer gap-x-2 px-2 py-1.5 text-brand-component-text-dark'
                    >
                      <MapPin className='size-4 shrink-0 text-brand-component-text-gray' />
                      <span className='truncate'>{feature.place_name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ) : (
              <CommandEmpty className='py-4 text-center text-sm text-brand-component-text-gray'>
                {t('no_locations_found')}
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
