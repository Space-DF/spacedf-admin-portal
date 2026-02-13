'use client';

import { useTranslations } from 'next-intl';

import { GoogleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

const AuthenticateWithGoogle = () => {
  const t = useTranslations('auth');

  const handleSignInGoogle = async () => {
    try {
      const res = await fetch('/api/auth/socials', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'google',
          callback_url: location.href,
        }),
      });
      const data: { redirectUrl: string } = await res.json();
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.log(`Func: handleSignInGoogle - PARAMS: err`, err);
    }
  };

  return (
    <div className='w-full animate-opacity-display-effect self-start'>
      <p className='mb-2 text-sm font-medium'>
        {t('continue_with_social_account')}
      </p>
      <Button
        variant='outline'
        className='h-12 w-full items-center gap-2 rounded-lg border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost'
        onClick={handleSignInGoogle}
      >
        <GoogleIcon />
        {t('continue_with_provider', { provider: 'Google' })}
      </Button>
    </div>
  );
};

export default AuthenticateWithGoogle;
