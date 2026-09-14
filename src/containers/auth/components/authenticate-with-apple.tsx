'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { AppleIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

const AuthenticateWithApple = ({ className }: { className?: string }) => {
  const t = useTranslations('auth');

  return (
    <Button
      type='button'
      className={cn(
        'h-9 w-full gap-2 rounded-xl bg-brand-component-fill-dark text-[14px] font-semibold text-brand-component-text-light shadow-button-base hover:bg-brand-component-hover-dark',
        className,
      )}
      onClick={() => {
        toast.success('Scheduled: Catch up');
      }}
    >
      <AppleIcon />
      {t('continue_with_provider', { provider: 'Apple' })}
    </Button>
  );
};

export default AuthenticateWithApple;
