'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { EmailColorPicker } from '@/containers/white-label/brand-customization/components/email/components/email-color-picker';
import { SocialLinkRow } from '@/containers/white-label/brand-customization/components/email/components/social-link-row';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';
import { LogoUploadField } from '@/containers/white-label/components/logo-upload-field';
import { SOCIAL_LINKS } from '@/containers/white-label/constants';

import { VariableInput } from '../brand-identity/components/variable-input';

export const BrandEmail = () => {
  const t = useTranslations('white-label');

  const { register, control, setValue, watch } =
    useFormContext<BrandCustomizationFormValues>();

  const brandName = watch('brandIdentity.brand_name');

  const {
    invitationImagePreviewUrl,
    setInvitationImagePreviewUrl,
    verificationImagePreviewUrl,
    setVerificationImagePreviewUrl,
    resetPasswordImagePreviewUrl,
    setResetPasswordImagePreviewUrl,
    activeImageType,
  } = useEmailStore(
    useShallow((state) => ({
      invitationImagePreviewUrl: state.invitationImagePreviewUrl,
      setInvitationImagePreviewUrl: state.setInvitationImagePreviewUrl,
      verificationImagePreviewUrl: state.verificationImagePreviewUrl,
      setVerificationImagePreviewUrl: state.setVerificationImagePreviewUrl,
      resetPasswordImagePreviewUrl: state.resetPasswordImagePreviewUrl,
      setResetPasswordImagePreviewUrl: state.setResetPasswordImagePreviewUrl,
      activeImageType: state.activeImageType,
    })),
  );

  const handleInvitationImageChange = (file: File | null) => {
    setInvitationImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setValue('email.invitationImageUrl', file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleVerificationImageChange = (file: File | null) => {
    setVerificationImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setValue('email.verificationImageUrl', file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleResetPasswordImageChange = (file: File | null) => {
    setResetPasswordImagePreviewUrl(file ? URL.createObjectURL(file) : null);
    setValue('email.resetPasswordImageUrl', file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const activeEmailValue = useMemo(() => {
    switch (activeImageType) {
      case 'invitation':
        return invitationImagePreviewUrl;
      case 'verification':
        return verificationImagePreviewUrl;
      case 'reset-password':
        return resetPasswordImagePreviewUrl;
      default:
        return null;
    }
  }, [
    activeImageType,
    invitationImagePreviewUrl,
    verificationImagePreviewUrl,
    resetPasswordImagePreviewUrl,
  ]);

  const handleLogoUploadChange = (file: File | null) => {
    switch (activeImageType) {
      case 'invitation':
        handleInvitationImageChange(file);
        break;
      case 'verification':
        handleVerificationImageChange(file);
        break;
      case 'reset-password':
        handleResetPasswordImageChange(file);
        break;
      default:
        break;
    }
  };

  const activeImageLabel = useMemo(() => {
    switch (activeImageType) {
      case 'invitation':
        return t('invitation_email_image');
      case 'verification':
        return t('verification_email_image');
      case 'reset-password':
        return t('reset_password_email_image');
      default:
        return '';
    }
  }, [activeImageType, t]);

  return (
    <div className='animate-opacity-display-effect space-y-6 pb-6'>
      <div className='space-y-4'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('email_branding')}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('email_branding_subtitle')}
          </p>
        </div>

        <div className='space-y-4'>
          <FormField
            control={control}
            name='email.senderName'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('sender_name')}
                </FormLabel>
                <FormControl>
                  <VariableInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder={t('enter_sender_name')}
                    className='text-brand-component-text-dark font-medium'
                    brandName={brandName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='email.senderEmail'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('sender_email')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('enter_sender_email')}
                    className='text-sm text-brand-component-text-dark font-medium'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-2 gap-3'>
            <Controller
              control={control}
              name='email.primaryEmailColor'
              render={({ field: { value, onChange } }) => (
                <EmailColorPicker
                  label={t('primary_email_color')}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name='email.emailBackgroundColor'
              defaultValue='#FFFFFF'
              render={({ field: { value, onChange } }) => (
                <EmailColorPicker
                  label={t('background_color')}
                  value={value ?? '#FFFFFF'}
                  onChange={onChange}
                />
              )}
            />
          </div>

          <FormField
            control={control}
            name='email.emailFooterText'
            render={({ field }) => (
              <FormItem className='space-y-1.5'>
                <FormLabel className='text-body font-semibold text-brand-component-text-dark'>
                  {t('email_footer_text')}
                </FormLabel>
                <FormControl>
                  <VariableInput
                    value={field.value || ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    placeholder={t('enter_email_footer_text')}
                    className='text-brand-component-text-dark font-medium'
                    brandName={brandName}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className='space-y-3'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {activeImageLabel}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('email_image_subtitle')}
          </p>
        </div>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <LogoUploadField
              label=''
              value={activeEmailValue}
              onChange={handleLogoUploadChange}
              accept='image/png, image/jpeg'
              maxSizeMB={5}
              hint='Recommend .png or .jpg file (max 5MB)'
              clickToUploadText={t('click_to_upload')}
            />
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='space-y-1'>
          <h2 className='text-[16px] font-semibold text-brand-component-text-dark'>
            {t('social_media_links')}
          </h2>
          <p className='text-body text-brand-component-text-gray font-normal leading-normal'>
            {t('social_media_links_subtitle')}
          </p>
        </div>

        <div className='border border-brand-component-stroke-dark-soft rounded-xl p-3 space-y-3 bg-white'>
          {SOCIAL_LINKS.map(({ key, label, icon: Icon }) => (
            <SocialLinkRow
              key={key}
              socialKey={key}
              label={label}
              icon={Icon}
              control={control}
              register={register}
            />
          ))}
        </div>
      </div>

      <div className='border border-brand-component-stroke-dark-soft rounded-xl p-4 flex items-center justify-between bg-brand-fill-surface'>
        <div className='space-y-0.5 max-w-[80%]'>
          <h3 className='text-sm font-semibold text-brand-component-text-dark leading-tight'>
            {t('show_org_logo_in_emails')}
          </h3>
          <p className='text-xs text-brand-component-text-gray font-normal leading-normal'>
            {t('show_org_logo_in_emails_subtitle')}
          </p>
        </div>
        <Controller
          control={control}
          name='email.showOrgLogoInEmail'
          render={({ field: { value, onChange } }) => (
            <Switch checked={value} onCheckedChange={onChange} />
          )}
        />
      </div>
    </div>
  );
};
