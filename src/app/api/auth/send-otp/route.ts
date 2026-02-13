import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();
    const response = await api.post('/bootstrap/auth/send-otp', { email });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};
