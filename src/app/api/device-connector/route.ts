import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const GET = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('search');
  try {
    const response = await api.get(`/device-connector?search=${name}`);
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const response = await api.post('/device-connector/', {
      ...body,
      status: 'disconnected',
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
