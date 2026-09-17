import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

interface LogoUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  hint: string;
  previewImgClassName?: string;
  clickToUploadText: string;
}

export const LogoUploadField = ({
  label,
  value,
  onChange,
  accept = 'image/png',
  maxSizeMB,
  hint,
  previewImgClassName = 'max-h-20 max-w-full object-contain mb-2 rounded',
  clickToUploadText,
}: LogoUploadFieldProps) => {
  const t = useTranslations('white-label');
  const acceptObject = accept
    .split(',')
    .reduce<Record<string, string[]>>((acc, curr) => {
      const mime = curr.trim();
      if (mime === 'image/png') {
        acc['image/png'] = ['.png'];
      } else if (mime === 'image/svg+xml') {
        acc['image/svg+xml'] = ['.svg'];
      } else if (mime === 'image/x-icon') {
        acc['image/x-icon'] = ['.ico'];
      } else {
        acc[mime] = [];
      }
      return acc;
    }, {});

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const error = fileRejections[0].errors[0];
        if (error.code === 'file-too-large' && !!maxSizeMB) {
          toast.error(t('file_size_exceeds_limit', { size: maxSizeMB }));
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
    accept: acceptObject,
    maxSize: maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined,
    multiple: false,
  });

  return (
    <div className='space-y-1.5'>
      {label && (
        <span className='text-xs font-semibold text-brand-component-text-dark'>
          {label}
        </span>
      )}
      {value ? (
        <div className='border border-brand-component-stroke-dark-soft rounded-xl p-4 flex flex-col items-center justify-center text-center bg-brand-component-fill-gray-light h-32 relative group'>
          <Image
            src={value}
            width={240}
            height={80}
            alt='Preview'
            className={previewImgClassName}
            unoptimized
          />
          <button
            type='button'
            onClick={() => onChange(null)}
            className='absolute top-2 right-2 p-1.5 bg-white border border-brand-component-stroke-dark-soft rounded-full text-brand-icon-dark hover:bg-brand-component-fill-negative-soft/30 transition-colors cursor-pointer'
          >
            <X className='size-3.5' />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border border-dashed rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 h-32 relative ${
            isDragActive
              ? 'border-brand-component-text-dark bg-brand-component-fill-dark-soft/40 scale-105'
              : 'border-brand-component-stroke-dark-soft bg-brand-background-fill-surface hover:bg-brand-component-fill-dark-soft/30'
          }`}
        >
          <input {...getInputProps()} />
          <Button size='icon' variant='outline' className='mb-2'>
            <UploadCloud className='size-4 text-brand-component-text-gray' />
          </Button>
          <span className='text-xs font-semibold text-brand-component-text-dark'>
            {isDragActive ? t('drop_file_here') : clickToUploadText}
          </span>
          <span className='text-[11px] text-brand-component-text-gray mt-1 leading-normal font-normal max-w-32'>
            {hint}
          </span>
        </div>
      )}
    </div>
  );
};
