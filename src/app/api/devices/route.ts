import { NextRequest, NextResponse } from 'next/server';
import queryString from 'query-string';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

import { AddDeviceCredentials } from '@/types';

export const POST = async (req: NextRequest) => {
  try {
    const slugName = await getServerOrganization();
    const body: AddDeviceCredentials[] = await req.json();
    const response = await api.post('/devices/bulk-create/', body, {
      headers: {
        'X-Organization': slugName,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const GET = async (req: NextRequest) => {
  const pageIndex = req.nextUrl.searchParams.get('pageIndex') || 0;
  const search = req.nextUrl.searchParams.get('search') || undefined;
  const organization = await getServerOrganization();
  const status = req.nextUrl.searchParams.get('status') || undefined;
  const location = req.nextUrl.searchParams.get('location') || undefined;
  const keyFeature = req.nextUrl.searchParams.get('key_feature') || undefined;
  const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
  const offset = Number(pageIndex) * limit;

  try {
    const url = queryString.stringifyUrl({
      url: '/devices/',
      query: {
        limit,
        offset,
        search,
        status,
        location,
        key_feature: keyFeature,
      },
    });

    const response = await api.get(url, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
