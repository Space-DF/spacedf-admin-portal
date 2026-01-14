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
      <div className='mx-auto my-10 flex size-full flex-col items-center justify-center px-5 md:max-w-xl'>
        <SpaceDFLogoFull />
        <p className='my-6 text-3xl font-semibold'>{t('sign_in_to_SpaceDF')}</p>
        <AuthenticateWithGoogle />
        <AuthenticateWithApple />
        <Separator className='my-4 bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft' />
        <SignInForm />
      </div>
    </WaitingAuth>
  );
}
