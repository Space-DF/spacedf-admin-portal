import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const POST = async (request: NextRequest) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    await api.post('/bootstrap/auth/send-email-confirm', { email });
    return NextResponse.json({ message: 'Email sent' }, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
};
