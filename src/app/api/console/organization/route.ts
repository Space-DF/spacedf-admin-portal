import { NextResponse } from 'next/server';

import { api } from '@/lib/api';

import { handleError } from '@/utils/error';
import { getServerOrganization } from '@/utils/server-actions';

export const GET = async () => {
  try {
    const organization = await getServerOrganization();
    const data = await api.get(`/organizations`, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    return handleError(err);
  }
};
