import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { useEmailStore } from '@/containers/white-label/brand-customization/stores/email';

import { NEXT_PUBLIC_AUTH_API } from '@/shared/env';

export const ResetPasswordForm = () => {
  const resetPasswordImagePreviewUrl = useEmailStore(
    (state) => state.resetPasswordImagePreviewUrl,
  );

  return (
    <>
      <Image
        width={244.5}
        height={221.25}
        quality={100}
        priority={true}
        className='max-w-full'
        src={
          resetPasswordImagePreviewUrl ||
          `${NEXT_PUBLIC_AUTH_API}/static/images/auth/forget_password.png`
        }
        alt='Email Illustration'
        unoptimized
      />
      <h1 className='text-lg font-semibold mb-[18px]'>Reset Password</h1>
      <div className='flex flex-col space-y-2 text-xs text-brand-typo-body-soft text-center w-full'>
        <p>Need to reset password? No problem.</p>
        <p>Just click the button below</p>
        <div className='flex w-full justify-center'>
          <Button className='flex space-x-1.5 w-fit items-center py-3 px-[15px] rounded-lg text-[--primary-text-color] bg-[--primary-color] hover:bg-[--primary-color] hover:opacity-80'>
            <p className='leading-4'>Reset Password</p>{' '}
            <ArrowUpRight size={15} />
          </Button>
        </div>
      </div>
    </>
  );
};
