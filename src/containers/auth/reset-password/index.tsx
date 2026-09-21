'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SpaceDFLogoFull } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/input';

import { useRouter } from '@/i18n/routing';

import { useResetPassword } from './hooks/useResetPassword';
import { createNewPasswordSchema } from './schema';

type CreateNewPasswordFormValues = z.infer<typeof createNewPasswordSchema>;

const primaryButtonClassName =
  'h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark';

export const CreateNewPasswordForm = () => {
  const t = useTranslations('auth');

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    mutateAsync: triggerResetPassword,
    isPending: isMutatingResetPassword,
  } = useResetPassword();

  const form = useForm<CreateNewPasswordFormValues>({
    resolver: zodResolver(createNewPasswordSchema),
  });

  const router = useRouter();

  const onSubmit = async (data: CreateNewPasswordFormValues) => {
    if (!token) return;
    const { password } = data;
    await triggerResetPassword({ token, password });
    router.push('/auth/sign-in');
  };

  return (
    <div className='mx-auto my-10 flex w-full flex-col items-center px-5'>
      <SpaceDFLogoFull />

      <div className='mt-6 flex w-full max-w-[400px] animate-opacity-display-effect flex-col items-center gap-6 rounded-2xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-6'>
        <p className='w-full text-center text-3xl font-semibold leading-[44px] text-brand-component-text-dark'>
          {t('create_new_password')}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex w-full flex-col gap-5'
          >
            <div className='flex flex-col gap-4'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('new_password')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder={t('new_password')}
                        disabled={isMutatingResetPassword}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirm_new_password')}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder={t('confirm_password')}
                        disabled={isMutatingResetPassword}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type='submit'
              className={primaryButtonClassName}
              loading={isMutatingResetPassword}
            >
              {t('continue')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
