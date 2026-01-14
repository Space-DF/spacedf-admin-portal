import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useSendOtp } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/hooks/useSendOtp';

interface ResendCodeBtnProps {
  email: string;
}

export default function ResendCodeBtn({ email }: ResendCodeBtnProps) {
  const t = useTranslations('auth');
  const [seconds, setSeconds] = useState(60);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const { trigger: sendOtp, isMutating: isSendingOtp } = useSendOtp();
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds - 1);
      }, 1000);
    } else {
      setIsResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [seconds]);

  const handleResendOTP = async () => {
    setSeconds(60);
    setIsResendEnabled(false);
    await sendOtp(email);
    toast.success(t('we_sent_a_code_to_email', { email }));
  };
  return (
    <Button
      className='h-12 w-full items-center gap-2 rounded-lg border border-brand-component-stroke-dark text-sm font-semibold dark:border-brand-component-stroke-light'
      variant='outline'
      disabled={!isResendEnabled}
      onClick={handleResendOTP}
      loading={isSendingOtp}
    >
      {t.rich('resend_code', { time: seconds })}
    </Button>
  );
}
