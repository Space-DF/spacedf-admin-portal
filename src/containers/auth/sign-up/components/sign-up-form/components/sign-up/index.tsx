'use client';
import { CircleUserRound, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputWithIcon } from '@/components/ui/input';
import {
  TypographyPrimary,
  TypographySecondary,
} from '@/components/ui/typography';
import { useSendOtp } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/hooks/useSendOtp';
import { singUpSchema } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/validator';

import { useIdentityStore } from '@/stores';

import { Link } from '@/i18n/routing';

export type SignUpCredentials = z.infer<typeof singUpSchema>;

const SignUpForm = () => {
  const t = useTranslations('auth');

  const form = useFormContext<SignUpCredentials>();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  const { trigger: sendOtp, isMutating: isSendingOtp } = useSendOtp();

  const { setRootAuth } = useIdentityStore(useShallow((state) => state));

  const onSubmit = async (values: SignUpCredentials) => {
    try {
      await sendOtp(values.email);
      setRootAuth(['verify-code', values.email]);
      toast.success('We have sent you an email with a one-time password.');
    } catch {
      toast.error('Sign up failed!');
    }
  };

  return (
    <div className='w-full animate-opacity-display-effect self-start'>
      <TypographyPrimary className='text-sm font-medium'>
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-5 space-y-5'>
          <div className='space-y-4'>
            <div className='flex gap-3'>
              <FormField
                control={form.control}
                name='first_name'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>{t('first_name')}</FormLabel>
                    <FormControl>
                      <InputWithIcon
                        prefixCpn={<CircleUserRound size={16} />}
                        {...field}
                        placeholder={t('first_name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='last_name'
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel>{t('last_name')}</FormLabel>
                    <FormControl>
                      <InputWithIcon
                        prefixCpn={<CircleUserRound size={16} />}
                        {...field}
                        placeholder={t('last_name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Mail size={16} />}
                      {...field}
                      placeholder='Email'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
                      suffixCpn={
                        <span
                          className='cursor-pointer'
                          onClick={() => setIsShowPassword(!isShowPassword)}
                        >
                          {isShowPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </span>
                      }
                      {...field}
                      placeholder={t('password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('confirm_password')}</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      type={isShowConfirmPassword ? 'text' : 'password'}
                      prefixCpn={<LockKeyhole size={16} />}
                      suffixCpn={
                        <span
                          className='cursor-pointer'
                          onClick={() =>
                            setIsShowConfirmPassword(!isShowConfirmPassword)
                          }
                        >
                          {isShowConfirmPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </span>
                      }
                      {...field}
                      placeholder={t('password')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type='submit'
            className='mb-2 h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-white shadow-sm dark:border-brand-component-stroke-light'
            loading={isSendingOtp}
          >
            {t('sign_up')}
          </Button>
        </form>
      </Form>
      <div className='mt-3.5 flex items-center justify-center gap-2 text-center text-sm'>
        <TypographySecondary className='font-semibold text-brand-component-text-gray'>
          {t('dont_have_an_account')}
        </TypographySecondary>
        <Link
          className='text-gradiant cursor-pointer font-semibold hover:underline'
          href='/auth/sign-in'
        >
          {t('sign_in')}
        </Link>
      </div>
    </div>
  );
};

export default SignUpForm;
