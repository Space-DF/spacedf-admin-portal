'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useShallow } from 'zustand/react/shallow';

import { SpaceDFLogoFull } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
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
  const { mutateAsync: signUp, isPending: isMutating } = useSignUp();
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
    <div className='mx-auto my-10 flex w-full flex-col items-center px-5'>
      <div className='flex w-full max-w-[400px] animate-opacity-display-effect flex-col items-center gap-6 rounded-2xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-6'>
        <SpaceDFLogoFull className='h-9 w-auto text-brand-component-text-dark' />

        <p className='w-full text-center text-3xl font-semibold leading-[44px] text-brand-component-text-dark'>
          {t('sign_up_to_SpaceDF')}
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex w-full flex-col gap-5'
          >
            <div className='flex flex-col gap-4'>
              <p className='text-center text-[14px] font-medium text-brand-component-text-gray'>
                {t.rich('we_sent_a_code_to', {
                  email: rootAuth[1],
                  span: (chunk) => (
                    <span className='text-brand-component-text-dark'>
                      {chunk}
                    </span>
                  ),
                })}
              </p>

              <FormField
                control={form.control}
                name='pin'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        {...field}
                      >
                        <InputOTPGroup className='w-full justify-center gap-2.5'>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className='size-9 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-component-fill-light text-[14px] font-medium text-brand-component-text-dark ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)] first:rounded-l-xl last:rounded-r-xl'
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className='justify-center' />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Button
                type='submit'
                className='h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark'
                disabled={!isDirty || !isValid || isMutating}
                loading={isMutating}
              >
                {t('continue')}
              </Button>

              <ResendCodeBtn email={rootAuth[1]} />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
