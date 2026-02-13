import useSWRMutation from 'swr/mutation';

import apiClient from '@/lib/api-client';

const sendOtp = async (url: string, { arg }: { arg: string }) =>
  apiClient.post(url, { email: arg });

export const useSendOtp = () => useSWRMutation('/api/auth/send-otp', sendOtp);
