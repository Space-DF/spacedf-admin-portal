'use client';

import { useTranslations } from 'next-intl';
import { Controller, useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AUTH_SCREENS } from '@/containers/white-label/brand-customization/components/auth/constants';
import { VariableInput } from '@/containers/white-label/brand-customization/components/brand-identity/components/variable-input';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useAuthBrandStore } from '@/containers/white-label/brand-customization/stores/auth';
import { LogoUploadField } from '@/containers/white-label/components/logo-upload-field';

export const AuthTab = () => {
  const t = useTranslations('white-label');

  const { control, watch, setValue } =
    useFormContext<BrandCustomizationFormValues>();

  const backgroundType = watch('auth.backgroundType');
  const brandName = watch('brandIdentity.brand_name');

  const isBackgroundImage = backgroundType === 'image';

  const { activeAuthScreen, setBackgroundUrl, backgroundUrl } =
    useAuthBrandStore(
      useShallow((state) => ({
        activeAuthScreen: state.activeAuthScreen,
        backgroundUrl: state.backgroundUrl,
        setBackgroundUrl: state.setBackgroundUrl,
      })),
    );

  const activeScreen =
    AUTH_SCREENS.find((screen) => screen.id === activeAuthScreen) ??
    AUTH_SCREENS[0];

  const headingName = `auth.${activeScreen.formKey}.headingText` as const;
  const supportName = `auth.${activeScreen.formKey}.supportText` as const;

  const setBackground = (file: File | null) => {
    const url = file ? URL.createObjectURL(file) : undefined;
    setValue('auth.backgroundUrl', file, { shouldDirty: true });
    setBackgroundUrl(url);
  };

  return (
    <div className='animate-opacity-display-effect space-y-6 pb-6'>
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('auth_branding')}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('auth_branding_subtitle')}
          </p>
        </div>
        <div className='space-y-4'>
          <FormField
            key={`${activeScreen.id}-heading`}
            control={control}
            name={headingName}
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel
                  className='text-body font-semibold text-brand-component-text-dark'
                  required
                >
                  {t('heading_text')}
                </FormLabel>
                <FormControl>
                  <VariableInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder={t('enter_heading_text')}
                    className='text-brand-component-text-dark font-medium'
                    brandName={brandName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            key={`${activeScreen.id}-support`}
            control={control}
            name={supportName}
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('support_text')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('enter_support_text')}
                    className='min-h-[120px] resize-none text-sm text-brand-component-text-dark font-medium'
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('background')}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('auth_background_subtitle')}
          </p>
        </div>

        <div className='space-y-5'>
          <FormField
            control={control}
            name='auth.backgroundType'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('background_type')}
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className='text-sm text-brand-component-text-dark font-medium'>
                      <SelectValue placeholder={t('background_type')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='color'>
                      {t('background_type_color')}
                    </SelectItem>
                    <SelectItem value='image'>
                      {t('background_type_image')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {isBackgroundImage && (
            <FormField
              control={control}
              name='auth.backgroundUrl'
              render={() => (
                <FormItem className='space-y-1.5'>
                  <FormControl>
                    <LogoUploadField
                      value={backgroundUrl}
                      onChange={setBackground}
                      label={t('background_image')}
                      hint={t('application_logo_hint')}
                      clickToUploadText={t('click_to_upload')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </div>

      <div className='border border-brand-component-stroke-dark-soft rounded-xl p-4 flex items-center justify-between bg-brand-fill-surface'>
        <div className='space-y-0.5 max-w-[80%]'>
          <h3 className='text-sm font-semibold text-brand-component-text-dark leading-tight'>
            {t('show_org_logo_on_header')}
          </h3>
          <p className='text-xs text-brand-component-text-gray font-normal leading-normal'>
            {t('show_org_logo_on_header_subtitle')}
          </p>
        </div>
        <Controller
          control={control}
          name='auth.showOrgLogoOnHeader'
          render={({ field: { value, onChange } }) => (
            <Switch checked={value} onCheckedChange={onChange} />
          )}
        />
      </div>
    </div>
  );
};
