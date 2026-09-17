import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';

import { NEXT_PUBLIC_AUTH_API } from '@/shared/env';

export const InvitedForm = () => {
  const { watch } = useFormContext<BrandCustomizationFormValues>();
  const [senderName = 'The @SpaceDF team', brandName = 'SpaceDF'] = watch([
    'email.senderName',
    'brandIdentity.brand_name',
  ]);
  const invitationImagePreviewUrl = useEmailStore(
    (state) => state.invitationImagePreviewUrl,
  );

  return (
    <>
      <Image
        width={274}
        height={221}
        quality={100}
        className='max-w-full'
        src={
          invitationImagePreviewUrl ||
          `${NEXT_PUBLIC_AUTH_API}/static/images/auth/invitation.png`
        }
        alt='Email Illustration'
        unoptimized
      />
      <h1 className='text-lg font-semibold mb-[18px]'>New Invitation</h1>
      <div className='flex flex-col space-y-2 text-xs text-brand-typo-body-soft text-start'>
        <p>Hello there,</p>
        <p>
          <span className='font-semibold text-[--primary-color]'>
            {'{@user}'}
          </span>{' '}
          has invited you to join space on {brandName} Platform.
          <br />
          By joining, you’ll get access to shared devices, dashboards, and
          resources for easier collaboration.
        </p>
        <p>To accept the invitation, simply click the button below:</p>
        <div className='flex justify-start w-full'>
          <Button className='flex rounded-lg space-x-1.5 items-center py-3 px-[15px] text-[--primary-text-color] bg-[--primary-color] hover:bg-[--primary-color] hover:opacity-80'>
            <p className='leading-4'>Accept Invitation</p>{' '}
            <ArrowUpRight size={15} />
          </Button>
        </div>
        <p>Note: This invitation will expire in 7 days.</p>
        <p>Welcome you on board and look forward to working with you!</p>
        <p className='font-semibold text-brand-component-text-dark text-start w-full text-xs break-all'>
          {resolveBrandNameVariable(senderName, brandName)}
        </p>
      </div>
    </>
  );
};
