import { NextRequest, NextResponse } from 'next/server';

import { AUTH_API } from '@/shared/env';

import { SignUpResponse } from '@/types';
import { ApiResponse } from '@/types/global';

interface SocialPayload {
  provider: 'google';
  callback_url: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: SocialPayload = await req.json();
    const response = await fetch(
      `${AUTH_API}/api/bootstrap/auth/login/socials`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        redirect: 'manual',
      },
    );
    if (response.status === 302) {
      const redirectUrl = response.headers.get('location');
      return NextResponse.json({ redirectUrl });
    }

    return NextResponse.json(
      { error: 'No redirect URL found' },
      { status: 400 },
    );
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
