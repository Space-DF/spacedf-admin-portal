import { Copy, CopyCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopiedButtonProps {
  value: string;
  className?: string;
}

const CopiedButton = ({ value, className }: CopiedButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const t = useTranslations('device-detail');

  const copyToClipboard = async (
    text: string,
    setIsCopied: (value: boolean) => void,
  ) => {
    try {
      await navigator.clipboard?.writeText(text);
      setIsCopied(true);
      toast.success(t('copy_success'));
    } finally {
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  };
  return (
    <button
      type='button'
      className={
        className ??
        'absolute right-0.5 rounded-r-lg top-1/2 -translate-y-1/2 text-brand-component-text-gray bg-brand-component-fill-light h-9 px-5 border border-brand-component-stroke-dark-soft'
      }
      onClick={() => copyToClipboard(value, setIsCopied)}
      disabled={isCopied}
    >
      {isCopied ? (
        <CopyCheck className='size-4' />
      ) : (
        <Copy className='size-4' />
      )}
    </button>
  );
};

export default CopiedButton;
