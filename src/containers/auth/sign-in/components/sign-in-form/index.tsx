'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { singInSchema } from '@/containers/auth/sign-in/components/sign-in-form/validator';

import { Link, useRouter } from '@/i18n/routing';

import { ErrorCode } from '@/types/auth';

export type SignInCredentials = z.infer<typeof singInSchema>;

const textLinkClassName =
  'flex h-9 items-center justify-center rounded-xl text-[14px] font-semibold text-brand-component-text-dark transition-colors hover:text-brand-component-text-dark-hover';

const SignInForm = () => {
  const t = useTranslations('auth');
  const form = useForm<SignInCredentials>({
    resolver: zodResolver(singInSchema),
  });
  const router = useRouter();
  const [isAuthenticating, startAuthentication] = useTransition();

  const onSubmit = async (values: SignInCredentials) => {
    startAuthentication(async () => {
      try {
        const result = await signIn('credentials', {
          ...values,
          remember_me: true,
          redirect: false,
        });

        if (result?.error === ErrorCode.CredentialsSignin) {
          toast.error(t('wrong_email_or_password'));
          return;
        }

        if (result?.ok) {
          toast.success(t('sign_in_success'));
          router.replace('/devices');
        }
      } catch {
        toast.error(t('failed_to_sign_in'));
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex w-full flex-col gap-5'
      >
        <div className='flex flex-col gap-4'>
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
                    disabled={isAuthenticating}
                    className='rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light px-3 text-[14px] font-medium text-brand-component-text-dark shadow-none placeholder:text-brand-component-text-gray dark:bg-brand-component-fill-light dark:text-brand-component-text-dark'
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
                    disabled={isAuthenticating}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-end'>
            <Link
              href='/auth/forgot-password'
              className={cn(textLinkClassName, 'px-5')}
            >
              {t('forgot_password')}
            </Link>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Button
            type='submit'
            className='h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark'
            loading={isAuthenticating}
            disabled={isAuthenticating}
          >
            {t('sign_in')}
          </Button>

          <div className='flex items-center justify-center'>
            <span className='text-[14px] font-medium text-brand-component-text-gray'>
              {t('dont_have_an_account')}
            </span>
            <Link
              href='/auth/sign-up'
              className={cn(textLinkClassName, 'px-2')}
            >
              {t('sign_up')}
            </Link>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default SignInForm;
