import { NextRequest, NextResponse } from 'next/server';

import { api } from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

import { UpdateDeviceRequest } from '@/types';

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;
  const organization = await getServerOrganization();
  try {
    const {
      dev_eui,
      join_eui,
      app_key,
      serial_number,
      ...rest
    }: UpdateDeviceRequest = await req.json();

    const lorawanDevice = { dev_eui, join_eui, app_key };
    const hasLorawanDevice = Object.values(lorawanDevice).some(
      (value) => value !== undefined,
    );

    const device = {
      ...rest,
      ...(hasLorawanDevice ? { lorawan_device: lorawanDevice } : {}),
      ...(serial_number !== undefined ? { api_device: { serial_number } } : {}),
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
  _: NextRequest,
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
