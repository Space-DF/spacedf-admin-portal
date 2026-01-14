'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';

import WaitingAuth from '@/containers/auth/components/loading';
import SignUpForm from '@/containers/auth/sign-up/components/sign-up-form';
import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';
import { singUpSchema } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/validator';
import VerifyCodeForm from '@/containers/auth/sign-up/components/verify-code-form';

import { useIdentityStore } from '@/stores';

export default function SignUpContainer() {
  const rootAuth = useIdentityStore(useShallow((state) => state.rootAuth));
  const form = useForm<SignUpCredentials>({
    resolver: zodResolver(singUpSchema),
  });

  return (
    <FormProvider {...form}>
      {rootAuth[0] === 'sign-up' ? (
        <WaitingAuth>
          <SignUpForm />
        </WaitingAuth>
      ) : (
        <VerifyCodeForm />
      )}
    </FormProvider>
  );
}
