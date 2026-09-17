import { create } from 'zustand';

interface BrandState {
  logoLightUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  theme: 'light' | 'dark';
  selectedPaletteId?: number;
}

interface BrandActionState {
  setLogoLightUrl: (logoLightUrl: string | null) => void;
  setFaviconLightUrl: (faviconLightUrl: string | null) => void;
  setFaviconDarkUrl: (faviconDarkUrl: string | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setSelectedPaletteId: (selectedPaletteId: number | undefined) => void;
  setBrandUrls: (urls: {
    logoLightUrl?: string | null;
    faviconLightUrl?: string | null;
    faviconDarkUrl?: string | null;
  }) => void;
}

export const useBrandStore = create<BrandState & BrandActionState>((set) => ({
  logoLightUrl: null,
  setLogoLightUrl: (logoLightUrl) =>
    set((state) => {
      if (state.logoLightUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.logoLightUrl);
      }
      return { logoLightUrl };
    }),
  faviconLightUrl: null,
  setFaviconLightUrl: (faviconLightUrl) =>
    set((state) => {
      if (state.faviconLightUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.faviconLightUrl);
      }
      return { faviconLightUrl };
    }),
  faviconDarkUrl: null,
  setFaviconDarkUrl: (faviconDarkUrl) =>
    set((state) => {
      if (state.faviconDarkUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.faviconDarkUrl);
      }
      return { faviconDarkUrl };
    }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  selectedPaletteId: undefined,
  setSelectedPaletteId: (selectedPaletteId) => set({ selectedPaletteId }),
  setBrandUrls: (urls) =>
    set((state) => {
      const updates: Partial<BrandState> = {};
      if ('logoLightUrl' in urls) {
        if (state.logoLightUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.logoLightUrl);
        }
        updates.logoLightUrl = urls.logoLightUrl;
      }
      if ('faviconLightUrl' in urls) {
        if (state.faviconLightUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.faviconLightUrl);
        }
        updates.faviconLightUrl = urls.faviconLightUrl;
      }
      if ('faviconDarkUrl' in urls) {
        if (state.faviconDarkUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.faviconDarkUrl);
        }
        updates.faviconDarkUrl = urls.faviconDarkUrl;
      }
      return updates;
    }),
}));
