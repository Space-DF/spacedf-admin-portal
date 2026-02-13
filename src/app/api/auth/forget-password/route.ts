import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();
    if (!password || !token) {
      return NextResponse.json(
        { error: 'Password and token are required' },
        { status: 400 },
      );
    }
    const response = await api.post('/bootstrap/auth/forget-password', {
      password,
      token,
    });
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}
