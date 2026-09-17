import { create } from 'zustand';

interface EmailState {
  invitationImagePreviewUrl: string | null;
  verificationImagePreviewUrl: string | null;
  resetPasswordImagePreviewUrl: string | null;
  activeImageType: 'invitation' | 'verification' | 'reset-password';
}

interface EmailActionState {
  setInvitationImagePreviewUrl: (url: string | null) => void;
  setVerificationImagePreviewUrl: (url: string | null) => void;
  setResetPasswordImagePreviewUrl: (url: string | null) => void;
  setActiveImageType: (
    type: 'invitation' | 'verification' | 'reset-password',
  ) => void;
  resetEmailBranding: () => void;
  setEmailPreviewUrls: (urls: {
    invitationImagePreviewUrl?: string | null;
    verificationImagePreviewUrl?: string | null;
    resetPasswordImagePreviewUrl?: string | null;
  }) => void;
}

export const useEmailStore = create<EmailState & EmailActionState>((set) => ({
  invitationImagePreviewUrl: null,
  verificationImagePreviewUrl: null,
  resetPasswordImagePreviewUrl: null,
  activeImageType: 'invitation',

  setInvitationImagePreviewUrl: (invitationImagePreviewUrl) =>
    set((state) => {
      if (state.invitationImagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.invitationImagePreviewUrl);
      }
      return { invitationImagePreviewUrl };
    }),
  setVerificationImagePreviewUrl: (verificationImagePreviewUrl) =>
    set((state) => {
      if (state.verificationImagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.verificationImagePreviewUrl);
      }
      return { verificationImagePreviewUrl };
    }),
  setResetPasswordImagePreviewUrl: (resetPasswordImagePreviewUrl) =>
    set((state) => {
      if (state.resetPasswordImagePreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(state.resetPasswordImagePreviewUrl);
      }
      return { resetPasswordImagePreviewUrl };
    }),
  setActiveImageType: (activeImageType) => set({ activeImageType }),
  resetEmailBranding: () =>
    set((state) => {
      if (state.invitationImagePreviewUrl?.startsWith('blob:'))
        URL.revokeObjectURL(state.invitationImagePreviewUrl);
      if (state.verificationImagePreviewUrl?.startsWith('blob:'))
        URL.revokeObjectURL(state.verificationImagePreviewUrl);
      if (state.resetPasswordImagePreviewUrl?.startsWith('blob:'))
        URL.revokeObjectURL(state.resetPasswordImagePreviewUrl);
      return {
        invitationImagePreviewUrl: null,
        verificationImagePreviewUrl: null,
        resetPasswordImagePreviewUrl: null,
        activeImageType: 'invitation',
      };
    }),
  setEmailPreviewUrls: (urls) =>
    set((state) => {
      const updates: Partial<EmailState> = {};
      if ('invitationImagePreviewUrl' in urls) {
        if (state.invitationImagePreviewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.invitationImagePreviewUrl);
        }
        updates.invitationImagePreviewUrl = urls.invitationImagePreviewUrl;
      }
      if ('verificationImagePreviewUrl' in urls) {
        if (state.verificationImagePreviewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.verificationImagePreviewUrl);
        }
        updates.verificationImagePreviewUrl = urls.verificationImagePreviewUrl;
      }
      if ('resetPasswordImagePreviewUrl' in urls) {
        if (state.resetPasswordImagePreviewUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(state.resetPasswordImagePreviewUrl);
        }
        updates.resetPasswordImagePreviewUrl =
          urls.resetPasswordImagePreviewUrl;
      }
      return updates;
    }),
}));
