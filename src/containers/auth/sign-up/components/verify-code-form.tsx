'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm, useFormContext } from 'react-hook-form';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';
import ResendCodeBtn from '@/containers/auth/sign-up/components/resend-code-btn';
import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';
import { useSignUp } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/hooks/useSignUp';

import { useIdentityStore } from '@/stores';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export default function VerifyCodeForm() {
  const t = useTranslations('auth');
  const rootAuth = useIdentityStore(useShallow((state) => state.rootAuth));
  const { trigger: signUp, isMutating } = useSignUp();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const formSignUp = useFormContext<SignUpCredentials>();
  const { isDirty, isValid } = form.formState;

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    const { first_name, last_name, email, password, confirm_password } =
      formSignUp.getValues();
    const { pin } = formData;
    await signUp(
      {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        otp: pin,
      },
      {
        onSuccess: async (data) => {
          await signIn('credentials', {
            redirect: false,
            sigUpSuccessfully: true,
            dataUser: JSON.stringify(data),
          });
          toast.success(t('sign_up_success'));
          window.location.href = `/devices`;
        },
        onError: (error) => {
          toast.error(
            error.response.message ||
              error.response.detail ||
              t('sign_up_failed'),
          );
        },
      },
    );
  }

  return (
    <div className='mx-auto flex size-full flex-col items-center justify-center px-5 md:max-w-xl h-screen'>
      <p className='my-6 text-3xl font-semibold'>{t('sign_up_to_SpaceDF')}</p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-4'
        >
          <FormField
            control={form.control}
            name='pin'
            render={({ field }) => (
              <FormItem className='space-y-4'>
                <FormLabel>
                  {t.rich('we_sent_a_code_to', {
                    email: rootAuth[1],
                    span: (chunk) => (
                      <span className='font-semibold text-brand-text-dark'>
                        {chunk}
                      </span>
                    ),
                  })}
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    {...field}
                  >
                    <InputOTPGroup className='w-full gap-6'>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className='h-20 flex-1 rounded-md border-none bg-brand-component-fill-dark-soft text-2xl font-bold'
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light'
            disabled={!isDirty || !isValid || isMutating}
            loading={isMutating}
          >
            {t('continue')}
          </Button>
        </form>
      </Form>
      <Separator className='my-4 bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft' />
      <ResendCodeBtn email={rootAuth[1]} />
    </div>
  );
}
