import api from '@/lib/api';

import { DeviceNotFound } from '@/components/layouts/device-not-found';
import DeviceDetail from '@/containers/devices/containers/device-detail';

import { getServerOrganization } from '@/utils';

import { Device } from '@/types';

const getDeviceDetail = async (
  slugName: string,
  deviceId: string,
): Promise<Device> =>
  api.get(`/devices/${deviceId}/`, {
    headers: {
      'X-Organization': slugName,
    },
  });

const DeviceDetailPage = async ({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) => {
  const { deviceId } = await params;
  const organization = await getServerOrganization();
  try {
    const device = await getDeviceDetail(organization, deviceId);
    return <DeviceDetail deviceServerData={device} />;
  } catch {
    return <DeviceNotFound />;
  }
};

export default DeviceDetailPage;
