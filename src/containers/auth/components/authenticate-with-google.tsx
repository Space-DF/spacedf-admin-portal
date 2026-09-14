'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { GoogleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

const AuthenticateWithGoogle = ({ className }: { className?: string }) => {
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
    <Button
      type='button'
      variant='outline'
      className={cn(
        'h-9 w-full gap-2 rounded-xl border-brand-component-stroke-dark-soft bg-brand-component-fill-light-fixed text-[14px] font-semibold text-brand-component-text-dark shadow-button-base hover:bg-brand-component-hover-gray-soft hover:text-brand-component-text-dark',
        className,
      )}
      onClick={handleSignInGoogle}
    >
      <GoogleIcon />
      {t('continue_with_provider', { provider: 'Google' })}
    </Button>
  );
};

export default AuthenticateWithGoogle;
