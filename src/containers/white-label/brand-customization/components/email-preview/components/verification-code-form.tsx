import Image from 'next/image';
import { useFormContext } from 'react-hook-form';

import { BrandCustomizationFormValues } from '@/containers/white-label/brand-customization/schema';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';
import { resolveBrandNameVariable } from '@/containers/white-label/brand-customization/utils';

import { NEXT_PUBLIC_AUTH_API } from '@/shared/env';

export const VerificationCodeForm = () => {
  const { watch } = useFormContext<BrandCustomizationFormValues>();
  const [senderName = 'The @SpaceDF team', brandName = 'SpaceDF'] = watch([
    'email.senderName',
    'brandIdentity.brand_name',
  ]);
  const verificationImagePreviewUrl = useEmailStore(
    (state) => state.verificationImagePreviewUrl,
  );

  return (
    <>
      <Image
        width={90}
        height={90}
        quality={100}
        priority={true}
        className='max-w-full'
        src={
          verificationImagePreviewUrl ||
          `${NEXT_PUBLIC_AUTH_API}/static/images/auth/verification_code.png`
        }
        alt='Email Illustration'
        unoptimized
      />
      <h1 className='text-lg font-semibold mb-[18px]'>
        Your Verification Code
      </h1>
      <div className='flex flex-col space-y-2 text-xs text-brand-typo-body-soft text-start w-full'>
        <p>Hello there,</p>
        <div>
          <p>Thank you for signing up to {brandName}!</p>
          <p>
            To verify your email and complete your account setup, please use the
            one-time code below:
          </p>
        </div>

        <div className='flex w-full py-2 my-1'>
          <span className='text-3xl font-semibold leading-9 text-[--primary-color]'>
            991629
          </span>
        </div>

        <p className='italic'>
          This code will expire in{' '}
          <span className='font-semibold text-[--primary-color]'>
            10 minutes.
          </span>
        </p>
        <p>Best regards,</p>
        <p className='font-semibold text-brand-component-text-dark text-start w-full text-xs break-all'>
          {resolveBrandNameVariable(senderName, brandName)}
        </p>
      </div>
    </>
  );
};
