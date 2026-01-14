import { NextRequest, NextResponse } from 'next/server';

import api from '@/lib/api';

import { handleError } from '@/utils/error';

export const GET = async () => {
  try {
    const response = await api.get(`/console/user/me`);
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    let avatar = undefined as string | undefined;
    const file = formData.get('avatar') as File;
    if (file && typeof file !== 'string') {
      const data = await api.get<{ presigned_url: string; file_name: string }>(
        '/console/presigned-url',
      );
      const presignedUrl = data.presigned_url;
      const fileBuffer = await file.arrayBuffer();
      const responseImage = await fetch(presignedUrl, {
        method: 'PUT',
        body: fileBuffer,
      });
      if (!responseImage.ok) {
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 },
        );
      }
      avatar = data.file_name;
    }

    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const company_name = formData.get('company_name') as string;
    const location = formData.get('location') as string;
    const title = formData.get('title') as string;

    const response = await api.put(`/console/user/me`, {
      first_name,
      last_name,
      company_name,
      location,
      title,
      avatar,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.log(error);
    return handleError(error);
  }
};
