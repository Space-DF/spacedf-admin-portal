'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { cn, getContrastColor } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { InvitedForm } from '@/containers/white-label/brand-customization/components/email-preview/components/invited-form';
import { ResetPasswordForm } from '@/containers/white-label/brand-customization/components/email-preview/components/reset-password-form';
import { VerificationCodeForm } from '@/containers/white-label/brand-customization/components/email-preview/components/verification-code-form';
import { useDimension } from '@/containers/white-label/brand-customization/hooks/use-dimension';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';
import { SOCIAL_LINKS } from '@/containers/white-label/constants';

import { NEXT_PUBLIC_AUTH_API } from '@/shared/env';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
});

const TEMPLATES = [
  {
    id: 'invitation',
    name: 'Invitation Email',
    component: <InvitedForm />,
  },
  {
    id: 'verification',
    name: 'Verification Code Email',
    component: <VerificationCodeForm />,
  },
  {
    id: 'reset-password',
    name: 'Reset Password Email',
    component: <ResetPasswordForm />,
  },
];

const VIRTUAL_WIDTH = 520;
const VIRTUAL_HEIGHT = 900;

export const EmailPreview = () => {
  const logoLightUrl = useBrandStore((state) => state.logoLightUrl);

  const setActiveImageType = useEmailStore((state) => state.setActiveImageType);

  const { control } = useFormContext<BrandCustomizationFormValues>();
  const [emailValues, brandIdentityBrandName] = useWatch({
    control,
    name: ['email', 'brandIdentity.brand_name'],
  });
  const brandName = brandIdentityBrandName || 'SpaceDF';

  const senderEmail = emailValues?.senderEmail || 'support@spacedf.com';
  const primaryEmailColor = emailValues?.primaryEmailColor || '#171A28';
  const emailBackgroundColor = emailValues?.emailBackgroundColor || '#FFFFFF';
  const emailFooterText = emailValues?.emailFooterText;
  const socialLinks = emailValues?.socialLinks;
  const showOrgLogoInEmail = emailValues?.showOrgLogoInEmail ?? true;

  const resolvedFooterText = emailFooterText
    ? resolveBrandNameVariable(emailFooterText, brandName)
    : '©2025 Digital Fortress. All rights reserved.';

  const { containerRef, dimensions } = useDimension(
    VIRTUAL_WIDTH,
    VIRTUAL_HEIGHT,
  );

  const [contentHeight, setContentHeight] = useState(VIRTUAL_HEIGHT);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { height } = entries[0].contentRect;
      if (height > 0) {
        setContentHeight(height);
      }
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, []);

  const scale =
    dimensions.width > 0 && dimensions.height > 0
      ? Math.min(
          dimensions.width / VIRTUAL_WIDTH,
          dimensions.height / (contentHeight + 32),
        )
      : 1;

  const contrastPrimaryColor = getContrastColor(primaryEmailColor);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(1);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const initialActiveImageType = useMemo(
    () => useEmailStore.getState().activeImageType,
    [],
  );

  const initialIndex = useMemo(() => {
    const index = TEMPLATES.findIndex((t) => t.id === initialActiveImageType);
    return index !== -1 ? index : 0;
  }, [initialActiveImageType]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateStates = () => {
      const snapIndex = api.selectedScrollSnap();
      setCurrent(snapIndex + 1);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());

      const template = TEMPLATES[snapIndex];
      const currentActiveImageType = useEmailStore.getState().activeImageType;
      if (template && template.id !== currentActiveImageType) {
        setActiveImageType(
          template.id as 'invitation' | 'verification' | 'reset-password',
        );
      }
    };

    updateStates();

    api.on('select', updateStates);
    api.on('reInit', updateStates);

    return () => {
      api.off('select', updateStates);
      api.off('reInit', updateStates);
    };
  }, [api, setActiveImageType]);

  useEffect(() => {
    if (!api) {
      return;
    }
    const unsubscribe = useEmailStore.subscribe((state) => {
      const activeImageType = state.activeImageType;
      const index = TEMPLATES.findIndex((t) => t.id === activeImageType);
      if (index !== -1 && api.selectedScrollSnap() !== index) {
        api.scrollTo(index);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [api]);

  const bodyTextContrastColor = getContrastColor(emailBackgroundColor);

  const isDarkBackground = bodyTextContrastColor === '#000000';

  const bodyTextColor = isDarkBackground ? '#1c1c1c' : '#ffffff';

  const fallbackEmailLogo = isDarkBackground
    ? `${NEXT_PUBLIC_AUTH_API}/static/images/branding/logo_black.png`
    : `${NEXT_PUBLIC_AUTH_API}/static/images/branding/logo_white.png`;

  const activeEmailLogo = logoLightUrl || fallbackEmailLogo;

  const isDarkFooter = contrastPrimaryColor === '#000000';

  const fallbackFooterEmailLogo = isDarkFooter
    ? `${NEXT_PUBLIC_AUTH_API}/static/images/branding/logo_black.png`
    : `${NEXT_PUBLIC_AUTH_API}/static/images/branding/logo_white.png`;

  const footerEmailLogo = logoLightUrl || fallbackFooterEmailLogo;

  const carouselContent = useMemo(() => {
    return (
      <CarouselContent className='-ml-4'>
        {TEMPLATES.map((template) => (
          <CarouselItem
            key={template.id}
            className='pl-4 flex justify-center items-center'
          >
            <div className='w-full text-[--body-text-color] max-w-[450px] rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 flex flex-col h-fit bg-[--background-color]'>
              <div className='px-6 py-7 text-center flex flex-col items-center'>
                <AnimatePresence initial={false}>
                  {showOrgLogoInEmail && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className='flex justify-center overflow-hidden'
                    >
                      <Image
                        width={129}
                        height={27}
                        src={activeEmailLogo || fallbackEmailLogo}
                        alt='Logo'
                        unoptimized
                        className='h-7 w-auto'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className='space-y-4 flex flex-col items-center w-full'>
                  <div className='space-y-4 flex flex-col items-center w-full justify-center'>
                    {template.component}
                  </div>
                  <p className='pt-6 text-xs text-brand-typo-body-soft w-full text-start'>
                    If you did not initiate this request, please contact us at{' '}
                    <span className='text-[--primary-color] '>
                      {senderEmail.slice(0, 100)}
                    </span>
                  </p>
                </div>
              </div>
              <div className='p-[14px] m-[14px] transition-colors duration-300 rounded-xl space-y-2 mt-auto bg-[--primary-color]'>
                <div className='flex justify-between items-center'>
                  <div>
                    <Image
                      src={footerEmailLogo || fallbackFooterEmailLogo}
                      width={140}
                      height={39}
                      alt='Logo'
                      className='object-contain h-10 w-auto'
                      unoptimized
                    />
                  </div>
                  <div className='flex items-center gap-x-3'>
                    {SOCIAL_LINKS.map(({ key, icon: Icon }) => {
                      const link = socialLinks?.[key];
                      if (!link?.enabled) return null;
                      return (
                        <div
                          key={key}
                          className='flex justify-center items-center size-7 rounded-full hover:opacity-80 transition-opacity bg-white/10'
                        >
                          <Icon className='size-4 text-[--primary-text-color]' />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className='flex justify-between items-center'>
                  <p className='m-0 text-[10px] text-[--primary-text-color] break-all'>
                    {resolvedFooterText}
                  </p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    );
  }, [
    showOrgLogoInEmail,
    activeEmailLogo,
    fallbackEmailLogo,
    senderEmail,
    socialLinks,
    resolvedFooterText,
    footerEmailLogo,
    fallbackFooterEmailLogo,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'z-10 flex-1 flex justify-center items-center w-full h-full relative overflow-hidden select-none',
        plusJakartaSans.className,
      )}
    >
      <div
        className='flex flex-col items-center transition-all duration-300 absolute'
        style={
          {
            width: VIRTUAL_WIDTH,
            height: contentHeight,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: 'center center',
            left: '50%',
            top: '50%',
            opacity: dimensions.width > 0 ? 1 : 0,
            '--primary-color': primaryEmailColor,
            '--primary-text-color': contrastPrimaryColor,
            '--background-color': emailBackgroundColor,
            '--body-text-color': bodyTextColor,
          } as React.CSSProperties
        }
      >
        <div ref={contentRef} className='w-full flex flex-col items-center'>
          <Carousel
            className='w-full max-w-[480px] py-4'
            setApi={setApi}
            opts={{ startIndex: initialIndex }}
          >
            {carouselContent}
          </Carousel>

          <div className='flex items-center justify-center gap-x-2 mt-6 z-10'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className='size-5 text-brand-component-text-dark' />
            </Button>

            <span className='text-sm font-semibold text-brand-component-text-dark min-w-[170px] text-center'>
              {TEMPLATES[current - 1]?.name || '---'}
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
      </div>
    </div>
  );
};
