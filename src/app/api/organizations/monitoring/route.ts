import { NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

import { MonitoringSetting } from '@/types';

const MONITORING_ENDPOINT = '/console/organizations/monitoring';

export const GET = async () => {
  const slugName = await getServerOrganization();

  try {
    const res = await api.get<MonitoringSetting[]>(MONITORING_ENDPOINT, {
      headers: {
        'X-Organization': slugName,
      },
    });

    return NextResponse.json(res);
  } catch (error) {
    return handleError(error);
  }
};
