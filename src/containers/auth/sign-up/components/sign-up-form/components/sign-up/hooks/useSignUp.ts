import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';

import { SignUpResponse } from '@/types';

interface SignUpPayload extends SignUpCredentials {
  otp: string;
}

const signUp = async (
  url: string,
  { arg }: { arg: SignUpPayload },
): Promise<SignUpResponse> => apiClient.post<SignUpResponse>(url, arg);

export const useSignUp = () => useSWRMutation('/api/auth/sign-up', signUp);
