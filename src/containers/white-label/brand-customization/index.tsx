'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOrganization } from '@/containers/devices/components/sidebar/hooks/useOrganization';
import { AuthTab } from '@/containers/white-label/brand-customization/components/auth';
import { DialogDiscard } from '@/containers/white-label/brand-customization/components/auth-preview/components/dialog-discard';
import { DialogNavigate } from '@/containers/white-label/brand-customization/components/auth-preview/components/dialog-navigate';
import { BrandIdentity } from '@/containers/white-label/brand-customization/components/brand-identity';
import { BrandStyle } from '@/containers/white-label/brand-customization/components/brand-style';
import { BrandEmail } from '@/containers/white-label/brand-customization/components/email';
import { BrandPreview } from '@/containers/white-label/brand-customization/components/preview';
import { useBrandCustomizationData } from '@/containers/white-label/brand-customization/hooks/use-brand-customization-data';
import { useNavigationGuard } from '@/containers/white-label/brand-customization/hooks/use-navigation-guard';
import { useUpdateOrganizationSettings } from '@/containers/white-label/brand-customization/hooks/use-organization-settings';
import {
  type AuthScreenContent,
  type BrandCustomizationFormValues,
  brandCustomizationSchema,
  DEFAULT_BRAND_CUSTOMIZATION,
  defaultDarkColors,
  defaultLightColors,
} from '@/containers/white-label/brand-customization/schema';
import { useAuthBrandStore } from '@/containers/white-label/brand-customization/stores/auth';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';
import {
  replaceWithBrandNameVariable,
  resolveBrandNameVariable,
} from '@/containers/white-label/brand-customization/utils';
import { PreviewWhiteLabel } from '@/containers/white-label/components/preview-white-label';

import { type CustomPageType } from '@/types';

export const BrandCustomization = () => {
  const t = useTranslations('white-label');

  const [activeTab, setActiveTab] = useState<string>('brand-identity');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const isInitialImageHydrationRef = useRef(true);

  const {
    setEmailPreviewUrls,
    invitationImagePreviewUrl,
    verificationImagePreviewUrl,
    resetPasswordImagePreviewUrl,
  } = useEmailStore(
    useShallow((state) => ({
      setEmailPreviewUrls: state.setEmailPreviewUrls,
      invitationImagePreviewUrl: state.invitationImagePreviewUrl,
      verificationImagePreviewUrl: state.verificationImagePreviewUrl,
      resetPasswordImagePreviewUrl: state.resetPasswordImagePreviewUrl,
    })),
  );

  const {
    setBrandUrls,
    logoLightUrl,
    faviconLightUrl,
    faviconDarkUrl,
    setSelectedPaletteId,
  } = useBrandStore(
    useShallow((state) => ({
      setBrandUrls: state.setBrandUrls,
      logoLightUrl: state.logoLightUrl,
      faviconLightUrl: state.faviconLightUrl,
      faviconDarkUrl: state.faviconDarkUrl,
      setSelectedPaletteId: state.setSelectedPaletteId,
    })),
  );

  const { setAuthBackgroundUrl, authBackgroundPreviewUrl } = useAuthBrandStore(
    useShallow((state) => ({
      setAuthBackgroundUrl: state.setBackgroundUrl,
      authBackgroundPreviewUrl: state.backgroundUrl,
    })),
  );

  const {
    organizationSettings,
    customEmails,
    customPages,
    isLoadingOrganizationSettings,
  } = useBrandCustomizationData();

  const { data: organization } = useOrganization();
  const currentDomain = `${organization?.slug_name}.myspacedf.com`;

  const { mutate: updateSettings, isPending: isUpdating } =
    useUpdateOrganizationSettings(currentDomain);

  const form = useForm<BrandCustomizationFormValues>({
    resolver: zodResolver(brandCustomizationSchema),
    defaultValues: DEFAULT_BRAND_CUSTOMIZATION,
    mode: 'onChange',
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  const { showDialog, confirmNavigation, cancelNavigation } =
    useNavigationGuard(isDirty);

  useEffect(() => {
    if (!organizationSettings?.result || !customEmails || !customPages) return;
    const {
      setting: {
        brand_name,
        site_title,
        site_description,
        themes: [lightColor, darkColor],
        border_radius: { button, input, card },
      },
    } = organizationSettings;
    const [inviteEmail, verifyEmail, resetPasswordEmail] = customEmails;
    const {
      sender_name,
      sender_email,
      show_logo,
      social_links: { linkedin_url, facebook_url, instagram_url, tiktok_url },
      metadata: { show_facebook, show_instagram, show_linkedin, show_tiktok },
      theme_colors: { background_color, primary_color },
      footer_text,
    } = inviteEmail;
    setBrandUrls({
      logoLightUrl: lightColor.url_logo,
      faviconLightUrl: lightColor.url_favicon,
      faviconDarkUrl: darkColor.url_favicon,
    });
    setEmailPreviewUrls({
      invitationImagePreviewUrl: inviteEmail.url_header_image,
      verificationImagePreviewUrl: verifyEmail.url_header_image,
      resetPasswordImagePreviewUrl: resetPasswordEmail.url_header_image,
    });
    const pageByType = new Map(
      customPages.map((page) => [page.page_type, page]),
    );
    const buildAuthScreen = (
      pageType: CustomPageType,
      fallback: AuthScreenContent,
    ): AuthScreenContent => {
      const page = pageByType.get(pageType);
      if (!page) return fallback;
      return {
        headingText: replaceWithBrandNameVariable(page.title || '', brand_name),
        supportText: replaceWithBrandNameVariable(
          page.subtitle || '',
          brand_name,
        ),
      };
    };
    const signInPage = pageByType.get('sign_in');
    const authBackgroundUrl = signInPage?.url_background_image || '';

    if (isInitialImageHydrationRef.current) {
      setBrandUrls({
        logoLightUrl: lightColor.url_logo,
        faviconLightUrl: lightColor.url_favicon,
        faviconDarkUrl: darkColor.url_favicon,
      });
      setEmailPreviewUrls({
        invitationImagePreviewUrl: inviteEmail.url_header_image,
        verificationImagePreviewUrl: verifyEmail.url_header_image,
        resetPasswordImagePreviewUrl: resetPasswordEmail.url_header_image,
      });
      setAuthBackgroundUrl(authBackgroundUrl || undefined);
      isInitialImageHydrationRef.current = false;
    }

    const defaultAuth = DEFAULT_BRAND_CUSTOMIZATION.auth!;
    reset({
      brandIdentity: {
        brand_name,
        site_title: replaceWithBrandNameVariable(site_title || '', brand_name),
        site_description: replaceWithBrandNameVariable(
          site_description || '',
          brand_name,
        ),
      },
      style: {
        buttonBorderRadius: button,
        inputBorderRadius: input,
        cardBorderRadius: card,
        lightColors: {
          ...defaultLightColors,
          ...lightColor.theme_colors,
        },
        darkColors: {
          ...defaultDarkColors,
          ...darkColor.theme_colors,
        },
      },
      email: {
        emailBackgroundColor: background_color,
        emailFooterText: replaceWithBrandNameVariable(
          footer_text || '',
          brand_name,
        ),
        primaryEmailColor: primary_color,
        senderName: replaceWithBrandNameVariable(sender_name || '', brand_name),
        senderEmail: sender_email,
        showOrgLogoInEmail: show_logo,
        socialLinks: {
          linkedin: {
            enabled: show_linkedin,
            url: linkedin_url,
          },
          facebook: {
            enabled: show_facebook,
            url: facebook_url,
          },
          instagram: {
            enabled: show_instagram,
            url: instagram_url,
          },
          tiktok: {
            enabled: show_tiktok,
            url: tiktok_url,
          },
        },
      },
      auth: {
        signIn: buildAuthScreen('sign_in', defaultAuth.signIn),
        signUp: buildAuthScreen('sign_up', defaultAuth.signUp),
        forgotPassword: buildAuthScreen(
          'forget_password',
          defaultAuth.forgotPassword,
        ),
        resetPassword: buildAuthScreen(
          'change_password',
          defaultAuth.resetPassword,
        ),
        backgroundType: authBackgroundUrl ? 'image' : 'color',
        backgroundUrl: undefined,
        showOrgLogoOnHeader: signInPage?.show_logo ?? true,
      },
    });
  }, [
    reset,
    organizationSettings,
    setBrandUrls,
    customEmails,
    customPages,
    setEmailPreviewUrls,
    setAuthBackgroundUrl,
  ]);

  const onSubmit = (values: BrandCustomizationFormValues) => {
    const hasAuthBackground =
      values.auth?.backgroundUrl instanceof File || !!authBackgroundPreviewUrl;

    if (values.auth?.backgroundType === 'image' && !hasAuthBackground) {
      toast.error(t('auth_background_image_required'));
      setActiveTab('auth-pages');
      return;
    }

    const brandName = values.brandIdentity.brand_name || '';

    const getFilePayload = (formValue: unknown, previewUrl: string | null) => {
      if (formValue instanceof File) return formValue;
      return previewUrl ? undefined : null;
    };

    const logoLight = getFilePayload(
      values.brandIdentity.logoLight,
      logoLightUrl,
    );
    const faviconLight = getFilePayload(
      values.brandIdentity.faviconLight,
      faviconLightUrl,
    );
    const faviconDark = getFilePayload(
      values.brandIdentity.faviconDark,
      faviconDarkUrl,
    );

    const invitationImageUrl = getFilePayload(
      values.email?.invitationImageUrl,
      invitationImagePreviewUrl,
    );
    const verificationImageUrl = getFilePayload(
      values.email?.verificationImageUrl,
      verificationImagePreviewUrl,
    );
    const resetPasswordImageUrl = getFilePayload(
      values.email?.resetPasswordImageUrl,
      resetPasswordImagePreviewUrl,
    );

    const isAuthBackgroundColor = values.auth?.backgroundType === 'color';

    const authBackgroundUrl = isAuthBackgroundColor
      ? null
      : getFilePayload(
          values.auth?.backgroundUrl,
          authBackgroundPreviewUrl ?? null,
        );

    if (isAuthBackgroundColor) {
      setAuthBackgroundUrl(undefined);
      if (values.auth?.backgroundUrl) {
        form.setValue('auth.backgroundUrl', undefined, { shouldDirty: true });
      }
    }

    const resolveAuthScreen = (screen?: AuthScreenContent) => ({
      headingText: resolveBrandNameVariable(
        screen?.headingText || '',
        brandName,
      ),
      supportText: resolveBrandNameVariable(
        screen?.supportText || '',
        brandName,
      ),
    });

    const updatedValues = {
      ...values,
      brandIdentity: {
        ...values.brandIdentity,
        site_title: resolveBrandNameVariable(
          values.brandIdentity.site_title || '',
          brandName,
        ),
        site_description: resolveBrandNameVariable(
          values.brandIdentity.site_description || '',
          brandName,
        ),
        logoLight,
        faviconLight,
        faviconDark,
      },
      email: values.email
        ? {
            ...values.email,
            senderName: resolveBrandNameVariable(
              values.email.senderName || '',
              brandName,
            ),
            emailFooterText: resolveBrandNameVariable(
              values.email.emailFooterText || '',
              brandName,
            ),
            invitationImageUrl,
            verificationImageUrl,
            resetPasswordImageUrl,
          }
        : undefined,
      auth: values.auth
        ? {
            ...values.auth,
            signIn: resolveAuthScreen(values.auth.signIn),
            signUp: resolveAuthScreen(values.auth.signUp),
            forgotPassword: resolveAuthScreen(values.auth.forgotPassword),
            resetPassword: resolveAuthScreen(values.auth.resetPassword),
            backgroundUrl: authBackgroundUrl,
          }
        : undefined,
    };

    updateSettings(updatedValues);
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  const performDiscard = () => {
    if (!organizationSettings?.result || !customEmails || !customPages) return;
    const {
      setting: {
        themes: [lightColor, darkColor],
      },
    } = organizationSettings;
    const [inviteEmail, verifyEmail, resetPasswordEmail] = customEmails;
    form.reset();
    setBrandUrls({
      logoLightUrl: lightColor.url_logo,
      faviconLightUrl: lightColor.url_favicon,
      faviconDarkUrl: darkColor.url_favicon,
    });
    setEmailPreviewUrls({
      invitationImagePreviewUrl: inviteEmail.url_header_image,
      verificationImagePreviewUrl: verifyEmail.url_header_image,
      resetPasswordImagePreviewUrl: resetPasswordEmail.url_header_image,
    });
    const signInPage = customPages.find((page) => page.page_type === 'sign_in');
    setAuthBackgroundUrl(signInPage?.url_background_image || undefined);
    setSelectedPaletteId(undefined);
    setShowDiscardDialog(false);
  };

  const handleDiscard = () => {
    if (!isDirty) {
      return;
    }
    setShowDiscardDialog(true);
  };

  return (
    <Form {...form}>
      <div className='flex flex-col md:flex-row h-dvh -mx-10 -mt-6 overflow-hidden bg-background'>
        <div className='w-full md:w-96 lg:w-[414px] shrink-0 border-r border-brand-component-stroke-dark-soft flex flex-col bg-white h-full z-10'>
          <div className='space-y-0.5 p-4 shrink-0'>
            <div className='flex items-center space-x-2'>
              <h1 className='text-[16px] font-semibold text-brand-component-text-dark leading-tight'>
                {t('brand_customization')}
              </h1>
            </div>
            <p className='text-xs text-brand-component-text-gray font-normal'>
              {t('custom_brand_subtitle')}
            </p>
          </div>

          <Separator className='h-px bg-brand-component-stroke-dark-soft w-full shrink-0' />

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex-1 flex flex-col min-h-0'
          >
            <TabsList className='w-full grid grid-cols-4 border-b border-brand-component-stroke-dark-soft rounded-none p-0 h-10 bg-transparent shrink-0'>
              <TabsTrigger
                value='brand-identity'
                className='px-1 py-2 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-brand-component-text-dark data-[state=active]:text-brand-component-text-dark rounded-none h-full bg-transparent shadow-none hover:text-brand-component-text-dark text-brand-component-text-gray transition-colors'
              >
                {t('brand_identity')}
              </TabsTrigger>
              <TabsTrigger
                value='style'
                className='px-1 py-2 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-brand-component-text-dark data-[state=active]:text-brand-component-text-dark rounded-none h-full bg-transparent shadow-none hover:text-brand-component-text-dark text-brand-component-text-gray transition-colors'
              >
                {t('style')}
              </TabsTrigger>
              <TabsTrigger
                value='auth-pages'
                className='px-1 py-2 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-brand-component-text-dark data-[state=active]:text-brand-component-text-dark rounded-none h-full bg-transparent shadow-none hover:text-brand-component-text-dark text-brand-component-text-gray transition-colors'
              >
                {t('auth_pages')}
              </TabsTrigger>
              <TabsTrigger
                value='email'
                className='px-1 py-2 text-sm font-semibold border-b-2 border-transparent data-[state=active]:border-brand-component-text-dark data-[state=active]:text-brand-component-text-dark rounded-none h-full bg-transparent shadow-none hover:text-brand-component-text-dark text-brand-component-text-gray transition-colors'
              >
                {t('email')}
              </TabsTrigger>
            </TabsList>
            <div className='flex-1 overflow-y-auto'>
              <TabsContent
                value='brand-identity'
                className='p-4 space-y-6 outline-none'
              >
                <BrandIdentity
                  domain={currentDomain}
                  isLoadingSettings={isLoadingOrganizationSettings}
                />
              </TabsContent>

              <TabsContent value='style' className='p-4 space-y-4 outline-none'>
                <BrandStyle />
              </TabsContent>

              <TabsContent
                value='auth-pages'
                className='p-4 space-y-4 outline-none'
              >
                <AuthTab />
              </TabsContent>

              <TabsContent value='email' className='p-4 space-y-4 outline-none'>
                <BrandEmail />
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <PreviewWhiteLabel
          currentPage={t('brand_customization')}
          preview={
            <BrandPreview
              activeTab={activeTab}
              domain={currentDomain}
              isLoadingSettings={isLoadingOrganizationSettings}
            />
          }
          onDiscard={handleDiscard}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          isDirty={isDirty}
          domain={currentDomain}
          lastUpdatedAt={organizationSettings?.setting?.updated_at}
        />
      </div>

      <DialogNavigate
        open={showDialog}
        onDiscard={confirmNavigation}
        onStay={cancelNavigation}
      />

      <DialogDiscard
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={performDiscard}
      />
    </Form>
  );
};
