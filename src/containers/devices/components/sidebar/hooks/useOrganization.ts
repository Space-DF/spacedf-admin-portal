import useSWR from 'swr';

import apiClient from '@/lib/api-client';

import { Organization } from '@/types/organization';

const getOrganization = async (url: string) => {
  return apiClient.get<Organization>(url);
};

export const useOrganization = () =>
  useSWR<Organization>(`/api/console/organization`, getOrganization);
