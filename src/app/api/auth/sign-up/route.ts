import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { SignUpCredentials } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';

import { handleError } from '@/utils/error';

import { SignUpResponse } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body: SignUpCredentials = await req.json();
    const response = await api.post<SignUpResponse>(
      '/bootstrap/auth/register',
      body,
    );
    return NextResponse.json(response);
  } catch (err) {
    return handleError(err);
  }
}
