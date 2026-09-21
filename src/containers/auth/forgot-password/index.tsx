import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';

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
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema } from '@/containers/auth/forgot-password/schema';

import { useRouter } from '@/i18n/routing';

import { useSendEmail } from './hooks/useSendEmail';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const inputClassName =
  'rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light px-3 text-[14px] font-medium text-brand-component-text-dark shadow-none placeholder:text-brand-component-text-gray dark:bg-brand-component-fill-light dark:text-brand-component-text-dark';

const primaryButtonClassName =
  'h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark';

const textLinkClassName =
  'flex h-9 items-center justify-center rounded-xl text-[14px] font-semibold text-brand-component-text-dark transition-colors hover:text-brand-component-text-dark-hover';

export const ForgotPasswordForm = () => {
  const t = useTranslations('auth');
  const [isSubmit, setIsSubmit] = useState(false);

  const { mutateAsync: sendEmail, isPending: isMutating } = useSendEmail();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const router = useRouter();

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    await sendEmail({ email });
    setIsSubmit(true);
  };

  const handleBackToSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <div className='mx-auto my-10 flex w-full flex-col items-center px-5'>
      <SpaceDFLogoFull />

      <div className='mt-6 flex w-full max-w-[400px] animate-opacity-display-effect flex-col items-center gap-6 rounded-2xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-6'>
        <div className='flex w-full flex-col items-center gap-2 text-center'>
          <p className='w-full text-3xl font-semibold leading-[44px] text-brand-component-text-dark'>
            {t('forgot_your_password')}
          </p>
          <p className='text-[14px] font-medium text-brand-component-text-gray'>
            {t(
              isSubmit
                ? 'reset_password_has_been_sent'
                : 'enter_email_address_and_will_send_you_a_link_to_reset_your_password',
            )}
          </p>
        </div>

        {isSubmit ? (
          <Button
            className={primaryButtonClassName}
            onClick={handleBackToSignIn}
          >
            {t('back_to_sign_in')}
          </Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex w-full flex-col gap-5'
            >
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
                        disabled={isMutating}
                        className={inputClassName}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col gap-2'>
                <Button
                  type='submit'
                  className={primaryButtonClassName}
                  loading={isMutating}
                >
                  {t('continue')}
                </Button>

                <div className='flex items-center justify-center'>
                  <span className='text-[14px] font-medium text-brand-component-text-gray'>
                    {t('never_mind')},
                  </span>
                  <button
                    type='button'
                    className={cn(textLinkClassName, 'px-2')}
                    onClick={handleBackToSignIn}
                  >
                    {t('back_to_sign_in')}
                  </button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
};
