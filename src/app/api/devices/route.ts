import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

import { DeviceCredentials } from '@/types';

export const POST = async (req: NextRequest) => {
  try {
    const organization = await getServerOrganization();
    const body: DeviceCredentials[] = await req.json();
    const response = await api.post('/devices/bulk-create/', body, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const GET = async (req: NextRequest) => {
  const LIMIT = 10;
  const pageIndex = req.nextUrl.searchParams.get('pageIndex') || 0;
  const search = req.nextUrl.searchParams.get('search') || '';
  const organization = await getServerOrganization();
  const status = req.nextUrl.searchParams.get('status') || '';
  const offset = Number(pageIndex) * LIMIT;
  try {
    const response = await api.get(
      `/devices/?limit=${LIMIT}&offset=${offset}&search=${search}&status=${status}`,
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
