'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';
import { useLoginSocial } from '@/hooks/use-login-social';

import { SpaceDFLogoFull } from '@/components/icons';
import LoadingFullScreen from '@/components/ui/loading-fullscreen';

const WaitingAuth = (props: PropsWithChildren) => {
  const searchParams = useSearchParams();
  const t = useTranslations('organization');
  const code = searchParams.get('code') || '';
  useLoginSocial();

  if (code) {
    return (
      <div
        className={cn(
          'absolute inset-0 bg-white transition-all dark:bg-brand-fill-outermost z-10 flex flex-col items-center justify-center',
        )}
      >
        <SpaceDFLogoFull width={300} height={64} className='mb-6' />
        <LoadingFullScreen className='size-auto' />
        <div className='mt-5 space-y-6 text-center'>
          <div className='text-brand-component-text-dark font-semibold text-3xl leading-normal'>
            {t('hello_welcome_to_digital_fortress')}
          </div>
          <div className='text-brand-component-text-gray text-lg'>
            {t('please_wait_a_couple_second')}
          </div>
        </div>
      </div>
    );
  }
  return <>{props.children}</>;
};

export default WaitingAuth;
