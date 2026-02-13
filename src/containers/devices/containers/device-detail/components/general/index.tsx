import { Separator } from '@/components/ui/separator';
import ActivationInformation from '@/containers/devices/containers/device-detail/components/general/components/activation-information';
import GeneralInformation from '@/containers/devices/containers/device-detail/components/general/components/general-information';

export default function GeneralTab() {
  return (
    <div className='space-y-3'>
      <GeneralInformation />
      <Separator />
      <ActivationInformation />
    </div>
  );
}
