import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const DELETE = async (
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  try {
    await api.delete(`/device-connector/${id}`);
    return NextResponse.json({
      message: 'Device connector deleted',
    });
  } catch (error) {
    return handleError(error);
  }
};
