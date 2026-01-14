import { NextResponse } from 'next/server';

import { ApiResponse } from '@/types';

export const handleError = (err: unknown) => {
  const { status, response } = (err as ApiResponse<unknown>) || {};
  if (!response?.detail && !response?.message) {
    return NextResponse.json({ response }, { status: status || 500 });
  }
  return NextResponse.json(
    {
      message: response?.message || response?.detail || 'Something went wrong',
    },
    { status: status || 500 },
  );
};
