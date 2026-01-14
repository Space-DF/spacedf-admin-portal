import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';

import { SignUpResponse } from '@/types';
import { ApiResponse } from '@/types/global';

export async function POST(
  req: NextRequest,
): Promise<NextResponse<SignUpResponse | ApiResponse<SignUpResponse>>> {
  try {
    const body: SignUpCredentials = await req.json();
    const response = await api.post<SignUpResponse>(
      '/console/google/login',
      body,
    );
    return NextResponse.json(response);
  } catch (err) {
    const error = err as ApiResponse<SignUpResponse>;
    return NextResponse.json(
      {
        error: error.error,
      },
      { status: error.status || 400 },
    );
  }
}
