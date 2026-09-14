'use client';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, PasswordInput } from '@/components/ui/input';
import { useSendOtp } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/hooks/useSendOtp';
import { singUpSchema } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/validator';

import { useIdentityStore } from '@/stores';

import { Link } from '@/i18n/routing';

export type SignUpCredentials = z.infer<typeof singUpSchema>;

const inputClassName =
  'rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light px-3 text-[14px] font-medium text-brand-component-text-dark shadow-none placeholder:text-brand-component-text-gray dark:bg-brand-component-fill-light dark:text-brand-component-text-dark';

const textLinkClassName =
  'flex h-9 items-center justify-center rounded-xl text-[14px] font-semibold text-brand-component-text-dark transition-colors hover:text-brand-component-text-dark-hover';

const SignUpForm = () => {
  const t = useTranslations('auth');

  const form = useFormContext<SignUpCredentials>();

  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useSendOtp();

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col gap-5'
      >
        <div className='flex flex-col gap-4'>
          <div className='flex gap-2.5'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem className='min-w-0 flex-1'>
                  <FormLabel>{t('first_name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('first_name')}
                      disabled={isSendingOtp}
                      className={inputClassName}
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
                <FormItem className='min-w-0 flex-1'>
                  <FormLabel>{t('last_name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('last_name')}
                      disabled={isSendingOtp}
                      className={inputClassName}
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
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('enter_your_email_address')}
                    disabled={isSendingOtp}
                    className={inputClassName}
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
                  <PasswordInput
                    {...field}
                    placeholder={t('enter_your_password')}
                    disabled={isSendingOtp}
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
                  <PasswordInput
                    {...field}
                    placeholder={t('confirm_password')}
                    disabled={isSendingOtp}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <Button
            type='submit'
            className='h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark'
            loading={isSendingOtp}
          >
            {t('sign_up')}
          </Button>

          <div className='flex items-center justify-center'>
            <span className='text-[14px] font-medium text-brand-component-text-gray'>
              {t('already_have_an_account')}
            </span>
            <Link
              href='/auth/sign-in'
              className={cn(textLinkClassName, 'px-2')}
            >
              {t('sign_in')}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
