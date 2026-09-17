import { useQueries } from '@tanstack/react-query';

import apiClient from '@/lib/api-client';

import {
  CHECK_ORGANIZATION_QUERY_KEY,
  CUSTOM_EMAILS_QUERY_KEY,
  CUSTOM_PAGES_QUERY_KEY,
} from '@/constants/query-keys';

import {
  type CheckOrganizationResponse,
  type CustomEmail,
  type CustomPage,
} from '@/types';

export const useBrandCustomizationData = () => {
  const [organizationQuery, customEmailsQuery, customPagesQuery] = useQueries({
    queries: [
      {
        queryKey: [...CHECK_ORGANIZATION_QUERY_KEY],
        queryFn: () =>
          apiClient.get<CheckOrganizationResponse>(`/api/organizations/check`),
      },
      {
        queryKey: [...CUSTOM_EMAILS_QUERY_KEY],
        queryFn: () => apiClient.get<CustomEmail[]>('/api/custom-emails'),
      },
      {
        queryKey: [...CUSTOM_PAGES_QUERY_KEY],
        queryFn: () => apiClient.get<CustomPage[]>('/api/custom-pages'),
      },
    ],
  });

  return {
    organizationSettings: organizationQuery.data,
    customEmails: customEmailsQuery.data,
    customPages: customPagesQuery.data,
    isLoading:
      organizationQuery.isLoading ||
      customEmailsQuery.isLoading ||
      customPagesQuery.isLoading,
    isLoadingOrganizationSettings: organizationQuery.isLoading,
  };
};
