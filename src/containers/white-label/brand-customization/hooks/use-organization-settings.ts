import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';

import {
  CHECK_ORGANIZATION_QUERY_KEY,
  CUSTOM_EMAILS_QUERY_KEY,
  CUSTOM_PAGES_QUERY_KEY,
} from '@/constants/query-keys';

import {
  type BrandCustomizationFormValues,
  defaultDarkColors,
  defaultLightColors,
} from '../schema';

import {
  type CheckOrganizationResponse,
  type CustomEmail,
  type CustomPage,
  type OrganizationSetting,
} from '@/types';

interface UpdateOrganizationSettingsResponse extends OrganizationSetting {
  custom_emails?: CustomEmail[];
  custom_pages?: CustomPage[];
}

const clientUploadFile = async (
  file: unknown,
): Promise<string | null | undefined> => {
  if (file instanceof File) {
    const data = await apiClient.get<{
      presigned_url: string;
      file_name: string;
    }>('/api/presigned-url');
    const presignedUrl = data.presigned_url;
    const fileBuffer = await file.arrayBuffer();
    const responseImage = await fetch(presignedUrl, {
      method: 'PUT',
      body: fileBuffer,
    });
    if (!responseImage.ok) {
      throw new Error('Failed to upload image');
    }
    return data.file_name;
  }
  if (typeof file === 'string' && file.trim() !== '') {
    return undefined;
  }
  if (file === null || file === '') {
    return '';
  }
  return undefined;
};

export const useUpdateOrganizationSettings = (domain?: string) => {
  const queryClient = useQueryClient();
  const t = useTranslations('white-label');

  return useMutation<
    UpdateOrganizationSettingsResponse,
    Error,
    BrandCustomizationFormValues
  >({
    mutationFn: async (values) => {
      const [
        logoLight,
        faviconLight,
        faviconDark,
        invitationImageUrl,
        verificationImageUrl,
        resetPasswordImageUrl,
        authBackgroundImage,
      ] = await Promise.all([
        clientUploadFile(values.brandIdentity.logoLight),
        clientUploadFile(values.brandIdentity.faviconLight),
        clientUploadFile(values.brandIdentity.faviconDark),
        clientUploadFile(values.email?.invitationImageUrl),
        clientUploadFile(values.email?.verificationImageUrl),
        clientUploadFile(values.email?.resetPasswordImageUrl),
        clientUploadFile(values.auth?.backgroundUrl),
      ]);

      const authScreen = (
        pageType: CustomPage['page_type'],
        content?: { headingText?: string; supportText?: string },
      ) => ({
        page_type: pageType,
        title: content?.headingText || '',
        subtitle: content?.supportText || '',
        background_image: authBackgroundImage,
        show_logo: !!values.auth?.showOrgLogoOnHeader,
      });

      const body = {
        site_title: values.brandIdentity.site_title,
        site_description: values.brandIdentity.site_description,
        border_radius: {
          button: Number(values.style?.buttonBorderRadius ?? 8),
          input: Number(values.style?.inputBorderRadius ?? 8),
          card: Number(values.style?.cardBorderRadius ?? 6),
        },
        themes: [
          {
            theme_key: 'light',
            favicon: faviconLight,
            logo: logoLight,
            theme_colors: {
              ...defaultLightColors,
              ...values.style?.lightColors,
            },
          },
          {
            theme_key: 'dark',
            favicon: faviconDark,
            theme_colors: {
              ...defaultDarkColors,
              ...values.style?.darkColors,
            },
          },
        ],
        custom_emails: [
          {
            email_type: 'invitation_to_space',
            sender_name: values.email?.senderName || '',
            sender_email: values.email?.senderEmail || '',
            theme_colors: {
              background_color: values.email?.emailBackgroundColor || '#FFFFFF',
              primary_color: values.email?.primaryEmailColor || '#171A28',
            },
            footer_text: values.email?.emailFooterText || '',
            header_image: invitationImageUrl,
            show_logo: !!values.email?.showOrgLogoInEmail,
            social_links: {
              linkedin_url: values.email?.socialLinks?.linkedin?.url || '',
              facebook_url: values.email?.socialLinks?.facebook?.url || '',
              instagram_url: values.email?.socialLinks?.instagram?.url || '',
              tiktok_url: values.email?.socialLinks?.tiktok?.url || '',
            },
            metadata: {
              show_linkedin: !!values.email?.socialLinks?.linkedin?.enabled,
              show_facebook: !!values.email?.socialLinks?.facebook?.enabled,
              show_instagram: !!values.email?.socialLinks?.instagram?.enabled,
              show_tiktok: !!values.email?.socialLinks?.tiktok?.enabled,
            },
          },
          {
            email_type: 'verification_code',
            sender_name: values.email?.senderName || '',
            sender_email: values.email?.senderEmail || '',
            theme_colors: {
              background_color: values.email?.emailBackgroundColor || '#FFFFFF',
              primary_color: values.email?.primaryEmailColor || '#171A28',
            },
            footer_text: values.email?.emailFooterText || '',
            header_image: verificationImageUrl,
            show_logo: !!values.email?.showOrgLogoInEmail,
            social_links: {
              linkedin_url: values.email?.socialLinks?.linkedin?.url || '',
              facebook_url: values.email?.socialLinks?.facebook?.url || '',
              instagram_url: values.email?.socialLinks?.instagram?.url || '',
              tiktok_url: values.email?.socialLinks?.tiktok?.url || '',
            },
            metadata: {
              show_linkedin: !!values.email?.socialLinks?.linkedin?.enabled,
              show_facebook: !!values.email?.socialLinks?.facebook?.enabled,
              show_instagram: !!values.email?.socialLinks?.instagram?.enabled,
              show_tiktok: !!values.email?.socialLinks?.tiktok?.enabled,
            },
          },
          {
            email_type: 'reset_password',
            sender_name: values.email?.senderName || '',
            sender_email: values.email?.senderEmail || '',
            theme_colors: {
              background_color: values.email?.emailBackgroundColor || '#FFFFFF',
              primary_color: values.email?.primaryEmailColor || '#171A28',
            },
            footer_text: values.email?.emailFooterText || '',
            header_image: resetPasswordImageUrl,
            show_logo: !!values.email?.showOrgLogoInEmail,
            social_links: {
              linkedin_url: values.email?.socialLinks?.linkedin?.url || '',
              facebook_url: values.email?.socialLinks?.facebook?.url || '',
              instagram_url: values.email?.socialLinks?.instagram?.url || '',
              tiktok_url: values.email?.socialLinks?.tiktok?.url || '',
            },
            metadata: {
              show_linkedin: !!values.email?.socialLinks?.linkedin?.enabled,
              show_facebook: !!values.email?.socialLinks?.facebook?.enabled,
              show_instagram: !!values.email?.socialLinks?.instagram?.enabled,
              show_tiktok: !!values.email?.socialLinks?.tiktok?.enabled,
            },
          },
        ],
        custom_pages: [
          authScreen('sign_in', values.auth?.signIn),
          authScreen('sign_up', values.auth?.signUp),
          authScreen('forget_password', values.auth?.forgotPassword),
          authScreen('change_password', values.auth?.resetPassword),
        ],
        brand_name: values.brandIdentity.brand_name,
      };

      return apiClient.patch<UpdateOrganizationSettingsResponse>(
        '/api/organizations/settings',
        body,
      );
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CheckOrganizationResponse>(
        [...CHECK_ORGANIZATION_QUERY_KEY],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            setting: {
              id: data.id,
              brand_name: data.brand_name,
              site_title: data.site_title,
              site_description: data.site_description,
              theme_mode: data.theme_mode || old.setting.theme_mode,
              border_radius: data.border_radius,
              themes: data.themes,
              updated_at: dayjs().toISOString(),
            },
          };
        },
      );

      if (data.custom_emails) {
        queryClient.setQueryData<CustomEmail[]>(
          [...CUSTOM_EMAILS_QUERY_KEY],
          data.custom_emails,
        );
      }
      if (data.custom_pages) {
        queryClient.setQueryData<CustomPage[]>(
          [...CUSTOM_PAGES_QUERY_KEY],
          data.custom_pages,
        );
      }
      const url = domain
        ? domain.startsWith('http')
          ? domain
          : `https://${domain}`
        : '';
      toast.success(t('brand_customization_updated_success'), {
        action: url
          ? {
              label: t('open_link'),
              onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
            }
          : undefined,
        style: { maxWidth: 'none' },
        classNames: {
          actionButton:
            '!bg-background !text-foreground !border-px !border-brand-component-stroke-dark-soft hover:!bg-accent hover:!text-accent-foreground',
        },
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update brand settings');
    },
  });
};
