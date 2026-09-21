import { useQuery } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import { ORGANIZATION_QUERY_KEY } from '@/constants/query-keys';

import { Organization } from '@/types/organization';

export const useOrganization = () => {
  return useQuery<Organization, Error>({
    queryKey: [...ORGANIZATION_QUERY_KEY],
    queryFn: () => apiClient.get<Organization>(`/api/console/organization`),
  });
};
