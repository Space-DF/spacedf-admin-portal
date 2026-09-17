import { create } from 'zustand';

import type { AuthScreenId } from '../components/auth/constants';

interface AuthState {
  activeAuthScreen: AuthScreenId;
  setActiveAuthScreen: (screen: AuthScreenId) => void;
  backgroundUrl?: string;
  setBackgroundUrl: (url?: string) => void;
}

export const useAuthBrandStore = create<AuthState>((set, get) => ({
  activeAuthScreen: 'sign-in',
  setActiveAuthScreen: (activeAuthScreen) => set({ activeAuthScreen }),
  backgroundUrl: undefined,
  setBackgroundUrl: (backgroundUrl) => {
    const oldUrl = get().backgroundUrl;
    if (
      typeof window !== 'undefined' &&
      oldUrl &&
      oldUrl.startsWith('blob:') &&
      oldUrl !== backgroundUrl
    ) {
      URL.revokeObjectURL(oldUrl);
    }
    set({ backgroundUrl });
  },
}));
