import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

import { Response, Trip } from '@/types';

export async function GET(
  _: NextRequest,
  { params }: { params: { deviceId: string } },
) {
  const { deviceId } = params;
  try {
    const trips: Response<Trip> = await api.get(
      `/trips/?limit=1&offset=0&space_device__device_id=${deviceId}`,
    );
    const latestTrip = trips.results[0];
    if (!latestTrip) {
      return NextResponse.json([]);
    }
    const tripDetail: Trip = await api.get(`/trips/${latestTrip.id}/`);

    return NextResponse.json(tripDetail.checkpoints);
  } catch (error) {
    return handleError(error);
  }
}
