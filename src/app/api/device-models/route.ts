import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('search');
  const organization = await getServerOrganization();
  try {
    const res = await api.get(
      `/device-models/?search=${name}&limit=8&offset=0`,
      {
        headers: {
          'X-Organization': organization,
        },
      },
    );
    return NextResponse.json(res);
  } catch (error) {
    return handleError(error);
  }
};
