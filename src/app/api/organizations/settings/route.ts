import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const organization = await getServerOrganization();
    const response = await api.patch('/organizations/settings', body, {
      headers: {
        'X-Organization': organization,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
