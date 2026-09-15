import {
  config,
  geocoding,
  type GeocodingFeature,
  type GeocodingOptions,
  type GeocodingSearchResult,
} from '@maptiler/client';

import {
  buildRegionPlaceName,
  distanceKm,
  type LngLat,
  regionByCoords,
  searchIslands,
} from '@/utils/disputed-regions';

type GeocodingReturnType = 'array' | 'obj';

interface GeocodingReverseOptions<
  T extends GeocodingReturnType = 'array',
> extends GeocodingOptions {
  returnType?: T;
}

type GeocodingReverseResult<T extends GeocodingReturnType> = T extends 'obj'
  ? Record<string, GeocodingSearchResult>
  : GeocodingSearchResult[];

const REVERSE_BATCH_LIMIT = 50;

const REVERSE_BATCH_WINDOW_MS = 50;

type PendingReverse = {
  coords: [number, number];
  resolve: (address: string | null) => void;
  reject: (error: unknown) => void;
};

type ReverseBatch = {
  options: GeocodingOptions | undefined;
  entries: PendingReverse[];
  timer: ReturnType<typeof setTimeout> | null;
};

const coordsKey = ([lng, lat]: [number, number]) => `${lng},${lat}`;

const getFeatureCoords = (feature: GeocodingFeature): LngLat | null => {
  const feat = feature as {
    center?: unknown;
    geometry?: { coordinates?: unknown };
  };
  const center = feat.center;
  if (
    Array.isArray(center) &&
    typeof center[0] === 'number' &&
    typeof center[1] === 'number'
  ) {
    return [center[0], center[1]];
  }
  const coords = feat.geometry?.coordinates;
  if (
    Array.isArray(coords) &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number'
  ) {
    return [coords[0], coords[1]];
  }
  return null;
};

// Rewrite the display name of any result inside the Hoàng Sa / Trường Sa regions
// to the correct Vietnamese administrative units. Region is decided purely by
// the coordinate (see `@/utils/disputed-regions`), then the address is REBUILT
// from a fixed template — so foreign country / province names (China, Taiwan,
// Philippines, Malaysia, …) can never leak through, without any per-name rules.
// Only `place_name` is consumed downstream (search list + trip address), so
// that's all we rewrite.
const sanitizeGeocodingFeature = (
  feature: GeocodingFeature,
): GeocodingFeature => {
  if (!feature) return feature;

  const coords = getFeatureCoords(feature);
  if (!coords) return feature;

  const region = regionByCoords(coords[0], coords[1]);
  if (!region) return feature;

  return {
    ...feature,
    place_name: buildRegionPlaceName(
      coords[0],
      coords[1],
      region,
      feature.text,
    ),
  };
};

const sanitizeGeocodingSearchResult = (
  result: GeocodingSearchResult,
): GeocodingSearchResult => {
  if (!result) return result;
  return {
    ...result,
    features: Array.isArray(result.features)
      ? result.features.map(sanitizeGeocodingFeature)
      : result.features,
  };
};

class MapGeocodingService {
  private static instance: MapGeocodingService;
  private initPromise: Promise<void> | null = null;

  private initialized = false;
  private reverseCache = new Map<string, GeocodingSearchResult>();
  /** Lookups waiting to leave, grouped by the options they were asked with. */
  private reverseBatches = new Map<string, ReverseBatch>();

  private constructor() {}

  static getInstance(): MapGeocodingService {
    if (!this.instance) {
      this.instance = new MapGeocodingService();
    }
    return this.instance;
  }

  private async init() {
    if (this.initialized) return;

    try {
      let apiKey: string | undefined;

      if (typeof window === 'undefined') {
        apiKey = process.env.MAPTILER_API_KEY;
      } else {
        apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
      }

      if (apiKey) {
        config.apiKey = apiKey;
        this.initialized = true;
      }
    } catch (error) {
      console.error({ error });
    }
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  public batchReverse = async <T extends GeocodingReturnType>(
    coords: [number, number][],
    options?: GeocodingReverseOptions<T>,
  ): Promise<GeocodingReverseResult<T>> => {
    await this.ensureInitialized();
    if (!this.initialized) {
      return (
        options?.returnType === 'obj' ? {} : []
      ) as GeocodingReverseResult<T>;
    }

    const coordsNeedToQuery: string[] = [];
    const resultMap = new Map<string, GeocodingSearchResult>();

    for (const [lng, lat] of coords) {
      const key = `${lng},${lat}`;

      if (this.reverseCache.has(key)) {
        resultMap.set(key, this.reverseCache.get(key)!);
      } else {
        coordsNeedToQuery.push(key);
      }
    }

    if (coordsNeedToQuery.length > 0) {
      try {
        const queryResults = await geocoding.batch(coordsNeedToQuery, {
          types: options?.types ?? ['address'],
          ...options,
        });

        queryResults.forEach((result, index) => {
          const key = coordsNeedToQuery[index];
          const sanitizedResult = sanitizeGeocodingSearchResult(result);
          resultMap.set(key, sanitizedResult);
          this.reverseCache.set(key, sanitizedResult);
        });
      } catch (error) {
        console.error({ error });
      }
    }

    if (options?.returnType === 'obj') {
      return Object.fromEntries(resultMap) as GeocodingReverseResult<T>;
    }

    const orderedResults = coords.map(([lng, lat]) => {
      const key = `${lng},${lat}`;
      return resultMap.get(key) ?? null;
    });

    return orderedResults as GeocodingReverseResult<T>;
  };

  private flushReverse = async (batchKey: string) => {
    const batch = this.reverseBatches.get(batchKey);
    if (!batch) return;

    this.reverseBatches.delete(batchKey);
    if (batch.timer) clearTimeout(batch.timer);

    const { entries, options } = batch;

    const unique = new Map<string, [number, number]>();
    for (const entry of entries)
      unique.set(coordsKey(entry.coords), entry.coords);
    const coords = Array.from(unique.values());

    try {
      const addresses = new Map<string, string | null>();

      for (let from = 0; from < coords.length; from += REVERSE_BATCH_LIMIT) {
        const chunk = coords.slice(from, from + REVERSE_BATCH_LIMIT);
        const results = await this.batchReverse<'array'>(chunk, options);

        chunk.forEach((coord, index) => {
          addresses.set(
            coordsKey(coord),
            results[index]?.features?.[0]?.place_name ?? null,
          );
        });
      }

      for (const entry of entries) {
        entry.resolve(addresses.get(coordsKey(entry.coords)) ?? null);
      }
    } catch (error) {
      for (const entry of entries) entry.reject(error);
    }
  };

  public reverse = (
    coords: [number, number],
    options?: GeocodingOptions,
  ): Promise<string | null> =>
    new Promise((resolve, reject) => {
      const batchKey = JSON.stringify(options ?? {});

      const batch = this.reverseBatches.get(batchKey) ?? {
        options,
        entries: [],
        timer: null,
      };
      batch.entries.push({ coords, resolve, reject });
      this.reverseBatches.set(batchKey, batch);

      if (batch.entries.length >= REVERSE_BATCH_LIMIT) {
        void this.flushReverse(batchKey);
        return;
      }

      batch.timer ??= setTimeout(
        () => void this.flushReverse(batchKey),
        REVERSE_BATCH_WINDOW_MS,
      );
    });

  public forward = async (
    query: string,
    options?: GeocodingOptions,
  ): Promise<GeocodingFeature[]> => {
    const trimmed = query?.trim();
    if (!trimmed) return [];

    const limit = options?.limit ?? 8;

    // Local gazetteer first, so Vietnamese island names resolve even when the
    // upstream geocoder has no entry for them (and even before the API key is
    // ready / when there's no key at all).
    const local = searchIslands(trimmed);
    const localFeatures = local.map(
      (hit) =>
        ({
          id: hit.id,
          text: hit.place_name,
          place_name: hit.place_name,
          center: hit.center,
          geometry: { type: 'Point', coordinates: hit.center },
        }) as unknown as GeocodingFeature,
    );

    await this.ensureInitialized();

    let remote: GeocodingFeature[] = [];
    if (this.initialized) {
      try {
        const result = await geocoding.forward(trimmed, {
          limit,
          ...options,
        });
        remote = (result?.features ?? []).map(sanitizeGeocodingFeature);
      } catch (error) {
        console.error({ error });
      }
    }

    const filteredRemote = remote.filter((feature) => {
      const c = getFeatureCoords(feature);
      return !c || !local.some((hit) => distanceKm(c, hit.center) < 2);
    });

    return [...localFeatures, ...filteredRemote].slice(0, limit);
  };
}

export const geocodingService = MapGeocodingService.getInstance();
