import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const slugName = await getServerOrganization();

  try {
    const body = await request.json();

    const data = await api.patch(
      `/console/organizations/monitoring/${id}`,
      body,
      {
        headers: {
          'X-Organization': slugName,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
};
