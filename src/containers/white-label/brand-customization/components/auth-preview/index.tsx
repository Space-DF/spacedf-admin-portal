'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import type { AuthScreenFormKey } from '@/containers/white-label/brand-customization/components/auth/constants';
import { AUTH_SCREENS } from '@/containers/white-label/brand-customization/components/auth/constants';
import {
  AuthLogo,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  SignInScreen,
  SignUpScreen,
} from '@/containers/white-label/brand-customization/components/auth-preview/components/screens';
import { useDimension } from '@/containers/white-label/brand-customization/hooks/use-dimension';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useAuthBrandStore } from '@/containers/white-label/brand-customization/stores/auth';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';

const VIRTUAL_WIDTH = 900;
const VIRTUAL_HEIGHT = 820;
const CONTROLS_RESERVED_HEIGHT = 96;

const SCREEN_COMPONENTS: Record<
  AuthScreenFormKey,
  | typeof SignInScreen
  | typeof SignUpScreen
  | typeof ForgotPasswordScreen
  | typeof ResetPasswordScreen
> = {
  signIn: SignInScreen,
  signUp: SignUpScreen,
  forgotPassword: ForgotPasswordScreen,
  resetPassword: ResetPasswordScreen,
};

export const AuthPreview = () => {
  const t = useTranslations('white-label');

  const logoLightUrl = useBrandStore((state) => state.logoLightUrl);
  const { setActiveAuthScreen, backgroundUrl } = useAuthBrandStore(
    useShallow((state) => ({
      setActiveAuthScreen: state.setActiveAuthScreen,
      backgroundUrl: state.backgroundUrl,
    })),
  );

  const initialIndex = useMemo(() => {
    const index = AUTH_SCREENS.findIndex(
      (screen) => screen.id === useAuthBrandStore.getState().activeAuthScreen,
    );
    return index === -1 ? 0 : index;
  }, []);

  const { control, watch } = useFormContext<BrandCustomizationFormValues>();
  const authValues = useWatch({ control, name: 'auth' });
  const brandName = watch('brandIdentity.brand_name');

  const style = watch('style');
  const colors = style?.lightColors;

  const primaryColor = colors?.primary || '#282828';
  const primaryTextColor = colors?.primary_text || '#FCFCFC';
  const secondaryColor = colors?.secondary || '#FFFFFF';
  const secondaryTextColor = colors?.secondary_text || '#282828';
  const backgroundColor = colors?.background || '#FFFFFF';
  const borderColor = colors?.border || '#E0E2E7';
  const textColor = colors?.text || '#282828';
  const supportTextColor = colors?.support_text || '#808080';
  const inputColor = colors?.input || '#FFFFFF';
  const inputBorderColor = colors?.input_border || '#E0E2E7';

  const buttonBorderRadius = style?.buttonBorderRadius ?? 8;
  const inputBorderRadius = style?.inputBorderRadius ?? 8;

  const showLogo = authValues?.showOrgLogoOnHeader ?? true;

  const isBackgroundImage =
    authValues?.backgroundType === 'image' && !!backgroundUrl;

  const logoUrl = logoLightUrl;

  const styleVars = {
    '--primary-color': primaryColor,
    '--primary-text-color': primaryTextColor,
    '--secondary-color': secondaryColor,
    '--secondary-text-color': secondaryTextColor,
    '--background-color': backgroundColor,
    '--border-color': borderColor,
    '--text-color': textColor,
    '--support-text-color': supportTextColor,
    '--input-color': inputColor,
    '--input-border-color': inputBorderColor,
    '--button-border-radius': `${buttonBorderRadius}px`,
    '--input-border-radius': `${inputBorderRadius}px`,
  } as React.CSSProperties;

  const { containerRef, dimensions } = useDimension(
    VIRTUAL_WIDTH,
    VIRTUAL_HEIGHT,
  );

  const scale =
    dimensions.width > 0 && dimensions.height > 0
      ? Math.max(
          0.1,
          Math.min(
            dimensions.width / VIRTUAL_WIDTH,
            (dimensions.height - CONTROLS_RESERVED_HEIGHT) / VIRTUAL_HEIGHT,
          ),
        )
      : 1;

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Slider -> editor: keep the active screen in sync when the carousel changes.
  useEffect(() => {
    if (!api) return;

    const updateStates = () => {
      const snapIndex = api.selectedScrollSnap();
      setCurrent(snapIndex);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());

      const screen = AUTH_SCREENS[snapIndex];
      if (
        screen &&
        screen.id !== useAuthBrandStore.getState().activeAuthScreen
      ) {
        setActiveAuthScreen(screen.id);
      }
    };

    updateStates();
    api.on('select', updateStates);
    api.on('reInit', updateStates);

    return () => {
      api.off('select', updateStates);
      api.off('reInit', updateStates);
    };
  }, [api, setActiveAuthScreen]);

  // Editor -> slider: scroll the carousel when the active screen changes.
  useEffect(() => {
    if (!api) return;

    const unsubscribe = useAuthBrandStore.subscribe((state) => {
      const index = AUTH_SCREENS.findIndex(
        (screen) => screen.id === state.activeAuthScreen,
      );
      if (index !== -1 && api.selectedScrollSnap() !== index) {
        api.scrollTo(index);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [api]);

  const carouselContent = useMemo(
    () => (
      <CarouselContent className='ml-0'>
        {AUTH_SCREENS.map(({ id, formKey }) => {
          const Component = SCREEN_COMPONENTS[formKey];
          const content = authValues?.[formKey];

          return (
            <CarouselItem key={id} className='pl-0'>
              <div
                className={cn(
                  'flex items-center justify-center overflow-hidden rounded-2xl border border-brand-component-stroke-dark-soft transition-colors duration-300',
                  !isBackgroundImage && 'bg-[--background-color]',
                )}
                style={{
                  width: VIRTUAL_WIDTH,
                  height: VIRTUAL_HEIGHT,
                  ...(isBackgroundImage
                    ? {
                        backgroundImage: `url(${backgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }
                    : {}),
                }}
              >
                <div className='flex w-full max-w-md flex-col items-center rounded-xl bg-[--background-color] px-6 py-10'>
                  <AuthLogo show={showLogo} logoUrl={logoUrl} />
                  <Component
                    headingText={resolveBrandNameVariable(
                      content?.headingText || '',
                      brandName,
                    )}
                    supportText={
                      content?.supportText
                        ? resolveBrandNameVariable(
                            content.supportText,
                            brandName,
                          )
                        : undefined
                    }
                  />
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    ),
    [
      authValues,
      showLogo,
      logoUrl,
      isBackgroundImage,
      backgroundUrl,
      brandName,
    ],
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'z-10 flex h-full w-full flex-1 select-none items-center justify-center overflow-hidden',
      )}
    >
      <div
        className='absolute'
        style={{
          ...styleVars,
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          left: '50%',
          top: '50%',
          opacity: dimensions.width > 0 ? 1 : 0,
        }}
      >
        <Carousel setApi={setApi} opts={{ startIndex: initialIndex }}>
          {carouselContent}
        </Carousel>
      </div>

      <div className='absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-x-2'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
        >
          <ChevronLeft className='size-5 text-brand-component-text-dark' />
        </Button>

        <span className='min-w-[170px] text-center text-sm font-semibold text-brand-component-text-dark'>
          {AUTH_SCREENS[current] ? t(AUTH_SCREENS[current].labelKey) : '---'}
        </span>

        <Button
          size='icon'
          variant='outline'
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
        >
          <ChevronRight className='size-5 text-brand-component-text-dark' />
        </Button>
      </div>
    </div>
  );
};
