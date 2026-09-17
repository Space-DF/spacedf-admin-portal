import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import { FavIcon, InfoOutline } from '@/components/icons';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvanceCustomLogo } from '@/containers/white-label/brand-customization/components/brand-identity/components/advance-custom-logo';
import { type BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useBrandStore } from '@/containers/white-label/brand-customization/stores/brand';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';
import { LogoUploadField } from '@/containers/white-label/components/logo-upload-field';
import { DEFAULT_DOMAIN } from '@/containers/white-label/constants';

import { VariableInput } from './components/variable-input';

interface Props {
  domain?: string;
  isLoading?: boolean;
  isLoadingSettings?: boolean;
}

export const BrandIdentity = ({
  domain,
  isLoading,
  isLoadingSettings,
}: Props) => {
  const t = useTranslations('white-label');

  const { control, watch, getValues, setValue } =
    useFormContext<BrandCustomizationFormValues>();

  const {
    logoLightUrl,
    setLogoLightUrl,
    faviconLightUrl,
    faviconDarkUrl,
    setFaviconDarkUrl,
    setFaviconLightUrl,
  } = useBrandStore(
    useShallow((state) => ({
      logoLightUrl: state.logoLightUrl,
      setLogoLightUrl: state.setLogoLightUrl,
      faviconLightUrl: state.faviconLightUrl,
      faviconDarkUrl: state.faviconDarkUrl,
      setFaviconLightUrl: state.setFaviconLightUrl,
      setFaviconDarkUrl: state.setFaviconDarkUrl,
    })),
  );

  const setLogoLight = (file: File | null) => {
    const url = file ? URL.createObjectURL(file) : null;
    setLogoLightUrl(url);
    setValue('brandIdentity.logoLight', file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const {
      faviconLight: currentFaviconLight,
      faviconDark: currentFaviconDark,
    } = getValues('brandIdentity');

    if (file) {
      if (!currentFaviconLight) {
        setFaviconLightUrl(url);
        setValue('brandIdentity.faviconLight', file, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
      if (!currentFaviconDark) {
        setFaviconDarkUrl(url);
        setValue('brandIdentity.faviconDark', file, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    }
  };

  const [brandName, websiteTitle, websiteDescription] = watch([
    'brandIdentity.brand_name',
    'brandIdentity.site_title',
    'brandIdentity.site_description',
  ]);

  const faviconUrl = faviconLightUrl || faviconDarkUrl || logoLightUrl;

  return (
    <div className='animate-opacity-display-effect space-y-6  '>
      <div className='space-y-4'>
        <div className='space-y-3'>
          <div className='space-y-6'>
            {isLoadingSettings ? (
              <div className='space-y-1.5'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-10 w-full rounded-lg' />
              </div>
            ) : (
              <FormField
                control={control}
                name='brandIdentity.brand_name'
                render={({ field }) => (
                  <FormItem className='space-y-1.5'>
                    <FormLabel className='!text-body font-semibold text-brand-component-text-dark'>
                      {t('brand_name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('enter_brand_name')}
                        className='rounded-lg text-sm text-brand-component-text-dark font-medium'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className='space-y-6 w-full'>
            {isLoadingSettings ? (
              <div className='space-y-4'>
                <div className='space-y-1.5'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-3 w-60' />
                  <Skeleton className='h-32 w-full rounded-lg' />
                </div>
                <Skeleton className='h-14 w-full rounded-lg' />
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='space-y-4'>
                  <div className='space-y-1 flex flex-col'>
                    <h3 className='text-[16px] font-semibold text-brand-component-text-dark'>
                      {t('brand_logo')}
                    </h3>
                    <p className='text-body text-brand-component-text-gray'>
                      {t('upload_your_brand_logo_to_represent_your_brand')}
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name='brandIdentity.logoLight'
                    render={() => (
                      <FormItem>
                        <LogoUploadField
                          value={logoLightUrl || null}
                          onChange={setLogoLight}
                          maxSizeMB={5}
                          hint={t('application_logo_hint')}
                          clickToUploadText={t('click_to_upload')}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <AdvanceCustomLogo />
              </div>
            )}
          </div>
        </div>
      </div>
      <Separator className='h-px bg-brand-component-stroke-dark-soft w-full' />
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('brand_identity')}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('brand_identity_subtitle')}
          </p>
        </div>

        <div className='border border-brand-component-stroke-dark-soft rounded-xl p-3 space-y-2 bg-brand-fill-surface'>
          <span className='text-body font-semibold text-brand-component-text-dark tracking-wider uppercase'>
            {t('search_engine_preview')}
          </span>
          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              {isLoadingSettings ? (
                <Skeleton className='size-10 rounded-md shrink-0' />
              ) : (
                <div className='size-10 rounded-md border border-brand-component-stroke-dark-soft flex items-center justify-center bg-brand-background-fill-surface shrink-0 p-1'>
                  {faviconUrl ? (
                    <Image
                      src={faviconUrl || ''}
                      alt='Favicon'
                      className='size-10 object-contain'
                      width={40}
                      height={40}
                      unoptimized
                    />
                  ) : (
                    <FavIcon className='size-10 text-brand-component-text-dark' />
                  )}
                </div>
              )}
              <div className='flex flex-col leading-none space-y-0.5'>
                {isLoadingSettings ? (
                  <Skeleton className='h-4 w-20' />
                ) : (
                  <span className='text-body font-semibold text-[#545454]'>
                    {brandName?.slice(0, 30) || 'SpaceDF'}
                  </span>
                )}
                {isLoading ? (
                  <Skeleton className='h-3 w-28 mt-1' />
                ) : (
                  <span className='text-xs text-[#006812] font-medium'>
                    https://{domain || DEFAULT_DOMAIN}
                  </span>
                )}
              </div>
            </div>
            {isLoadingSettings ? (
              <div className='space-y-2 mt-2'>
                <Skeleton className='h-4 w-4/5' />
                <Skeleton className='h-3 w-full' />
                <Skeleton className='h-3 w-56' />
              </div>
            ) : (
              <>
                <h4 className='text-[16px] font-medium text-[#1C0CB2] leading-snug line-clamp-2'>
                  {resolveBrandNameVariable(websiteTitle, brandName) ||
                    'SpaceDF - No-Code IoT Management Platform'}
                </h4>
                <p className='text-xs text-[#545454] leading-relaxed font-medium line-clamp-3'>
                  {resolveBrandNameVariable(websiteDescription, brandName) ||
                    'SpaceDF is a ready-to-use IoT platform...'}
                </p>
              </>
            )}
          </div>
        </div>
        <div className='bg-brand-component-fill-dark-soft px-1 flex items-center gap-x-1 border border-brand-component-stroke-dark-soft rounded w-fit'>
          <InfoOutline className='size-4 text-brand-component-text-gray' />
          <span className='text-xs font-normal text-brand-component-text-gray leading-5'>
            {t('type_to_insert_variable')}
          </span>
        </div>
        {isLoadingSettings ? (
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full rounded-lg' />
            <Skeleton className='h-3 w-48 mt-1' />
          </div>
        ) : (
          <FormField
            control={control}
            name='brandIdentity.site_title'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('website_title')}
                </FormLabel>
                <FormControl>
                  <VariableInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder={t('enter_website_title')}
                    className='text-brand-component-text-dark'
                    brandName={brandName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {isLoadingSettings ? (
          <div className='space-y-1.5'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-24 w-full rounded-lg' />
            <Skeleton className='h-3 w-56 mt-1' />
          </div>
        ) : (
          <FormField
            control={control}
            name='brandIdentity.site_description'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('website_description')}
                </FormLabel>
                <FormControl>
                  <VariableInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder={t('enter_website_description')}
                    className='text-brand-component-text-dark'
                    multiline
                    brandName={brandName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
