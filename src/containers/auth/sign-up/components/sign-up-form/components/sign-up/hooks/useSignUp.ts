import { useMutation } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';

import { SignUpResponse } from '@/types';

interface SignUpPayload extends SignUpCredentials {
  otp: string;
}

type SignUpError = {
  response: { message?: string; detail?: string };
};

const signUp = async (arg: SignUpPayload): Promise<SignUpResponse> =>
  apiClient.post<SignUpResponse>('/api/auth/sign-up', arg);

export const useSignUp = () =>
  useMutation<SignUpResponse, SignUpError, SignUpPayload>({
    mutationFn: signUp,
  });
