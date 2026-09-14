import { Separator } from '@/components/ui/separator';
import ActivationInformation from '@/containers/devices/containers/device-detail/components/general/components/activation-information';
import MonitoringArea from '@/containers/devices/containers/device-detail/components/general/components/monitoring-area';
import RemoveDeviceTab from '@/containers/devices/containers/device-detail/components/remove-device';

interface Props {
  deviceId: string;
  isDeviceWaterLevel: boolean;
}

export default function GeneralTab({ deviceId, isDeviceWaterLevel }: Props) {
  return (
    <div className='space-y-5'>
      <ActivationInformation deviceId={deviceId} />
      {isDeviceWaterLevel && (
        <>
          <Separator />
          <MonitoringArea deviceId={deviceId} />
        </>
      )}
      <Separator />
      <RemoveDeviceTab deviceId={deviceId} />
    </div>
  );
}
