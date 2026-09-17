import { NextResponse } from 'next/server';

import api from '@/lib/api';

import { getServerOrganization } from '@/utils';
import { handleError } from '@/utils/error';

export const GET = async () => {
  try {
    const slugName = await getServerOrganization();
    const res = await api.get(`/organizations/check/${slugName}`);
    return NextResponse.json(res);
  } catch (error) {
    return handleError(error);
  }
};
