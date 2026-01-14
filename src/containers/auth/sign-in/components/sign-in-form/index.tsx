'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { singInSchema } from '@/containers/auth/sign-in/components/sign-in-form/validator';

import { Link, useRouter } from '@/i18n/routing';

import { ErrorCode } from '@/types/auth';

export type SignInCredentials = z.infer<typeof singInSchema>;

const SignInForm = () => {
  const t = useTranslations('auth');
  const form = useForm<SignInCredentials>({
    resolver: zodResolver(singInSchema),
  });
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isAuthenticating, startAuthentication] = useTransition();
  const router = useRouter();
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
    <div className='w-full animate-opacity-display-effect self-start'>
      <TypographyPrimary className='text-sm font-medium'>
        {t('or_continue_with_email_address')}
      </TypographyPrimary>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='mt-5'>
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=''>Email</FormLabel>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={<Mail size={16} />}
                      {...field}
                      placeholder='Email'
                      className=''
                      disabled={isAuthenticating}
                    />
                  </FormControl>

                  <FormMessage className='' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className=''>{t('password')}</FormLabel>
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
                      disabled={isAuthenticating}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='mb-5 mt-4 flex items-center justify-end'>
            <Link
              href='/auth/forgot-password'
              className='cursor-pointer text-xs font-semibold hover:underline'
            >
              {t('forgot_password')}
            </Link>
          </div>
          <Button
            type='submit'
            className='mb-2 h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-white shadow-sm dark:border-brand-component-stroke-light'
            loading={isAuthenticating}
            disabled={isAuthenticating}
          >
            {t('sign_in')}
          </Button>
        </form>
      </Form>
      <div className='mt-3.5 flex items-center justify-center gap-2 text-center text-sm'>
        <TypographySecondary className='font-semibold text-brand-component-text-gray'>
          {t('dont_have_an_account')}
        </TypographySecondary>
        <Link
          className='text-gradiant cursor-pointer font-semibold hover:underline'
          href='/auth/sign-up'
        >
          {t('sign_up')}
        </Link>
      </div>
    </div>
  );
};

export default SignInForm;
