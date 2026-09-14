import { useTranslations } from 'next-intl';

import { SpaceDFLogoFull } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import AuthenticateWithApple from '@/containers/auth/components/authenticate-with-apple';
import AuthenticateWithGoogle from '@/containers/auth/components/authenticate-with-google';
import WaitingAuth from '@/containers/auth/components/loading';
import SignInForm from '@/containers/auth/sign-in/components/sign-in-form';

export default function SignInPage() {
  const t = useTranslations('auth');
  return (
    <WaitingAuth>
      <div className='mx-auto my-10 flex w-full flex-col items-center px-5'>
        <SpaceDFLogoFull />

        <div className='mt-6 flex w-full animate-opacity-display-effect flex-col items-center gap-6 rounded-2xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-6 max-w-[400px]'>
          <p className='w-full text-center text-3xl font-semibold leading-[44px] text-brand-component-text-dark'>
            {t('sign_in_to_SpaceDF')}
          </p>

          <div className='flex w-full flex-col gap-5'>
            <div className='flex w-full flex-col gap-2'>
              <AuthenticateWithGoogle />
              <AuthenticateWithApple />
            </div>

            <Separator className='bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft' />

            <SignInForm />
          </div>
        </div>
      </div>
    </WaitingAuth>
  );
}
