'use client';

import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { FavIcon, SpaceDFLogoFull } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { HeaderUrl } from '@/containers/white-label/brand-customization/components/header-url';
import { useDimension } from '@/containers/white-label/brand-customization/hooks/use-dimension';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';

interface Props {
  domain?: string;
  isLoading?: boolean;
  isLoadingSettings?: boolean;
}

const VIRTUAL_WIDTH = 1280;
const VIRTUAL_HEIGHT = 800;

export const BrandIdentityPreview = ({
  domain,
  isLoading,
  isLoadingSettings,
}: Props) => {
  const form = useFormContext<BrandCustomizationFormValues>();

  const [brandName, websiteTitle] = form.watch([
    'brandIdentity.brand_name',
    'brandIdentity.site_title',
  ]);

  const { faviconLightUrl, logoLightUrl, faviconDarkUrl } = useBrandStore(
    useShallow((state) => ({
      faviconLightUrl: state.faviconLightUrl,
      logoLightUrl: state.logoLightUrl,
      faviconDarkUrl: state.faviconDarkUrl,
    })),
  );

  const faviconLightActualUrl = faviconLightUrl || faviconDarkUrl;

  const faviconDarkActualUrl = faviconDarkUrl || faviconLightUrl;

  const { containerRef, scale, dimensions } = useDimension(
    VIRTUAL_WIDTH,
    VIRTUAL_HEIGHT,
  );

  return (
    <div
      ref={containerRef}
      className='flex-1 flex justify-center items-center p-6 md:p-12 z-10 w-full h-full relative overflow-hidden'
    >
      <div
        className='bg-brand-component-component-fill-dark rounded-xl border border-brand-component-stroke-dark-soft shadow-2xl flex flex-col overflow-hidden transition-all duration-300 absolute'
        style={{
          width: VIRTUAL_WIDTH,
          height: VIRTUAL_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          left: '50%',
          top: '50%',
          opacity: dimensions.width > 0 ? 1 : 0,
        }}
      >
        <HeaderUrl domain={domain} isLoading={isLoading} />
        <div className='grid grid-cols-2 shrink-0 select-none'>
          <div className='py-1 bg-brand-component-fill-dark-soft flex items-center justify-center px-4 gap-x-1 border-r border-brand-component-stroke-dark-soft'>
            {isLoadingSettings ? (
              <Skeleton className='size-5 rounded-sm shrink-0 bg-brand-component-text-light/20' />
            ) : faviconLightActualUrl ? (
              <Image
                src={faviconLightActualUrl}
                alt='Favicon Light'
                className='size-5 object-contain'
                width={20}
                height={20}
                unoptimized
              />
            ) : (
              <FavIcon className='size-5 text-black' />
            )}
            {isLoadingSettings ? (
              <Skeleton className='h-3 w-40 bg-black/20' />
            ) : (
              <span className='text-xs font-semibold text-black truncate max-w-72'>
                {resolveBrandNameVariable(websiteTitle, brandName) ||
                  'SpaceDF - No-Code IoT Management Platform'}
              </span>
            )}
          </div>

          <div className='py-1 bg-brand-component-fill-dark flex items-center justify-center px-4 gap-2'>
            {isLoadingSettings ? (
              <Skeleton className='size-5 rounded-sm shrink-0 bg-brand-component-text-dark/20' />
            ) : faviconDarkActualUrl ? (
              <Image
                src={faviconDarkActualUrl}
                alt='Favicon Dark'
                className='size-5 object-contain'
                width={20}
                height={20}
                unoptimized
              />
            ) : (
              <FavIcon className='size-5 text-brand-component-text-light' />
            )}
            {isLoadingSettings ? (
              <Skeleton className='h-3 w-40 bg-brand-component-text-dark/20' />
            ) : (
              <span className='text-xs font-semibold text-brand-component-text-light truncate max-w-72'>
                {resolveBrandNameVariable(websiteTitle, brandName) ||
                  'SpaceDF - No-Code IoT Management Platform'}
              </span>
            )}
          </div>
        </div>
        <div className='flex-1 bg-white flex flex-row min-h-0 overflow-hidden relative select-none'>
          <div className='flex-1 min-w-0 relative'>
            <Image
              src='/images/blur-preview-light.png'
              className='w-full h-full object-cover'
              width={740}
              height={251}
              alt='light'
            />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
              {logoLightUrl ? (
                <Image
                  src={logoLightUrl}
                  width={245}
                  height={72}
                  alt='Light Mode Logo'
                />
              ) : (
                <SpaceDFLogoFull
                  className='text-black'
                  width={288}
                  height={56}
                />
              )}
            </div>
          </div>
          <div className='flex-1 min-w-0 relative'>
            <Image
              src='/images/blur-preview-dark.png'
              className='w-full h-full object-cover'
              width={740}
              height={251}
              alt='dark'
            />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
              {logoLightUrl ? (
                <Image
                  src={logoLightUrl}
                  width={245}
                  height={72}
                  alt='Dark Mode Logo'
                />
              ) : (
                <SpaceDFLogoFull
                  className='text-white'
                  width={288}
                  height={56}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
