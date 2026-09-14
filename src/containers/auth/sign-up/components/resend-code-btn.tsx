import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useSendOtp } from '@/containers/auth/sign-up/components/sign-up-form/components/sign-up/hooks/useSendOtp';

interface ResendCodeBtnProps {
  email: string;
}

const formatCountdown = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function ResendCodeBtn({ email }: ResendCodeBtnProps) {
  const t = useTranslations('auth');
  const [seconds, setSeconds] = useState(60);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const { mutateAsync: sendOtp, isPending: isSendingOtp } = useSendOtp();
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
    <div className='flex items-center justify-center'>
      <span className='text-[14px] font-medium text-brand-component-text-gray'>
        {t('didnt_receive_a_code')}
      </span>
      <Button
        type='button'
        variant='outline'
        className='h-8 gap-2 rounded-[10px] border-0 bg-transparent px-1 text-xs font-semibold text-primary shadow-none hover:bg-transparent hover:opacity-80 disabled:opacity-100'
        disabled={!isResendEnabled}
        onClick={handleResendOTP}
        loading={isSendingOtp}
      >
        {seconds > 0
          ? t('resend_with_time', { time: formatCountdown(seconds) })
          : t('resend')}
      </Button>
    </div>
  );
}
