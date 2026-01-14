import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
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
import { InputWithIcon } from '@/components/ui/input';
import { forgotPasswordSchema } from '@/containers/auth/forgot-password/schema';

import { useRouter } from '@/i18n/routing';

import { useSendEmail } from './hooks/useSendEmail';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const t = useTranslations('auth');
  const [isSubmit, setIsSubmit] = useState(false);

  const { trigger: sendEmail, isMutating } = useSendEmail();

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
    <>
      <SpaceDFLogoFull />
      <div className='mt-6'>
        <div className='space-y-6 w-full animate-opacity-display-effect self-start'>
          <div className='space-y-2 text-center'>
            <p className='text-3xl font-semibold'>
              {t('forgot_your_password')}
            </p>
            <p className='text-brand-component-text-gray text-sm'>
              {t(
                isSubmit
                  ? 'reset_password_has_been_sent'
                  : 'enter_email_address_and_will_send_you_a_link_to_reset_your_password',
              )}
            </p>
          </div>
          {isSubmit ? (
            <div className='w-full justify-center flex animate-opacity-display-effect self-start'>
              <Button
                className='rounded-lg w-56 h-12 border-4 border-brand-heading bg-brand-fill-outermost shadow-sm'
                onClick={handleBackToSignIn}
              >
                {t('back_to_sign_in')}
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-[18px]'
              >
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-brand-component-text-gray text-sm'>
                        Email
                      </FormLabel>
                      <FormControl>
                        <InputWithIcon
                          prefixCpn={<Mail size={16} />}
                          placeholder={t('your_email')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='space-y-2'>
                  <Button
                    type='submit'
                    className='mb-2 h-11 w-full rounded-lg border-4 border-brand-heading bg-brand-fill-outermost shadow-sm'
                    loading={isMutating}
                  >
                    {t('continue')}
                  </Button>
                  <div className='flex justify-center'>
                    <span className='text-sm text-brand-component-text-dark text-center'>
                      {t('never_mind')},{' '}
                      <span
                        className='text-brand-component-text-dark hover:underline cursor-pointer font-semibold'
                        onClick={handleBackToSignIn}
                      >
                        {t('back_to_sign_in')}
                      </span>
                    </span>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </>
  );
};
