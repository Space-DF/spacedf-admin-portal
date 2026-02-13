import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } },
) => {
  const { id } = params;
  try {
    const response = await api.get(`/device-connector/${id}/test-connection`);
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
