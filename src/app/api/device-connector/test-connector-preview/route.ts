import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    await api.post('/device-connector/test-connection-preview/', body);
    return NextResponse.json({
      message: 'Connection test successful',
    });
  } catch (error) {
    return handleError(error);
  }
};
