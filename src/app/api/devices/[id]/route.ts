import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

import { Device, TableDevice } from '@/types';

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;
  const organization = await getServerOrganization();
  try {
    const body: TableDevice = await req.json();
    const device: Partial<Device> = {
      ...body,
      lorawan_device: {
        dev_eui: body.dev_eui,
        join_eui: body.join_eui,
        claim_code: body.claim_code,
        app_key: body.app_key,
      },
      network_server: body.network_server,
    };
    const response = await api.patch(`/devices/${id}/`, device, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;
  try {
    const organization = await getServerOrganization();
    const response = await api.delete(`/devices/${id}/`, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;
  try {
    const organization = await getServerOrganization();
    const response = await api.get(`/devices/${id}/`, {
      headers: {
        'X-Organization': organization,
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
