import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';

import { FavIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface FaviconUploadCardProps {
  value: string | null;
  fallbackValue: string | null;
  onChange: (file: File | null) => void;
  mode: 'light' | 'dark';
}

const FaviconUploadCard = ({
  value,
  onChange,
  mode,
  fallbackValue,
}: FaviconUploadCardProps) => {
  const t = useTranslations('white-label');

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        if (error.code === 'file-too-large') {
          toast.error(t('file_size_exceeds_limit', { size: 5 }));
        } else if (error.code === 'file-invalid-type') {
          toast.error(t('invalid_file_type'));
        } else {
          toast.error(error.message);
        }
        return;
      }
      const file = acceptedFiles[0];
      if (file) {
        onChange(file);
      }
    },
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/x-icon': ['.ico'],
      'image/vnd.microsoft.icon': ['.ico'],
      'image/bmp': ['.bmp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const isLight = mode === 'light';

  const imageValue = value || fallbackValue;

  return (
    <div
      {...getRootProps()}
      className='rounded-xl flex flex-col cursor-pointer transition-all duration-200 group relative'
    >
      <input {...getInputProps()} />

      {value && (
        <button
          type='button'
          onClick={(e) => {
            e.stopPropagation();
            onChange(null);
          }}
          className='absolute -top-2 size-6 -right-2 p-1 bg-brand-icon-gray flex justify-center items-center rounded-full z-50 transition-colors cursor-pointer'
        >
          <X className='size-3.5 text-white' />
        </button>
      )}
      <div className='space-y-1.5'>
        <div className='relative'>
          <div className='absolute top-5 right-[83.51px] z-10'>
            <div className='h-7 w-8 flex justify-center items-center'>
              {imageValue ? (
                <Image src={imageValue} width={16} height={16} alt='upload' />
              ) : (
                <FavIcon
                  className={cn(
                    'size-4',
                    isLight ? 'text-brand-component-text-dark' : 'text-white',
                  )}
                />
              )}
            </div>
          </div>
          <div className='rounded-xl overflow-hidden'>
            <Image
              src={`/images/preview-${isLight ? 'l' : 'd'}.png`}
              width={171}
              height={120}
              alt='favicon'
              className='w-full h-full object-contain'
              unoptimized
            />
          </div>
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 rounded-xl pointer-events-none'>
            <Button size='icon' variant='secondary' className='rounded-xl'>
              <UploadCloud className='size-3.5' />
            </Button>
          </div>
        </div>
        <span className='text-xs font-medium text-brand-component-text-dark'>
          {t(isLight ? 'light_mode_label' : 'dark_mode_label')}
        </span>
      </div>
    </div>
  );
};

export default FaviconUploadCard;
