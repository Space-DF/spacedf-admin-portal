import { useTranslations } from 'next-intl';

import { SpaceDFLogoFull } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import AuthenticateWithApple from '@/containers/auth/components/authenticate-with-apple';
import AuthenticateWithGoogle from '@/containers/auth/components/authenticate-with-google';
import SignUpForm from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up';

export default function SignUp() {
  const t = useTranslations('auth');
  return (
    <div className='mx-auto my-10 flex size-full flex-col items-center justify-center px-5 md:max-w-xl'>
      <SpaceDFLogoFull />
      <p className='my-6 text-3xl font-semibold'>{t('sign_up_to_SpaceDF')}</p>
      <AuthenticateWithGoogle />
      <AuthenticateWithApple />
      <Separator className='my-4 bg-brand-component-stroke-dark-soft dark:bg-brand-component-stroke-dark-soft' />
      <SignUpForm />
    </div>
  );
}
