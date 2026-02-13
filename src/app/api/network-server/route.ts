import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search') ?? '';
  const offset = Number(searchParams.get('offset')) || 0;
  const organization = await getServerOrganization();
  try {
    const response = await api.get(
      `/network-server?search=${search}&limit=7&offset=${offset}`,
      {
        headers: {
          'X-Organization': organization,
        },
      },
    );
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
