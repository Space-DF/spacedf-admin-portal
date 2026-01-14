import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button } from '../ui/button';

export const DeviceNotFound = () => {
  const t = useTranslations('common');

  return (
    <div className='h-[calc(100dvh-1.5rem)] flex flex-col items-center justify-center relative'>
      <div className='space-y-4 flex flex-col items-center'>
        <Image
          src='/images/org-not-exist.svg'
          alt='org not exist'
          width={529}
          height={408}
        />
        <div className='space-y-8'>
          <div className='flex flex-col space-y-6 text-center'>
            <span className='text-brand-component-text-dark font-medium text-4xl'>
              {t('the_device_does_not_exist')}
            </span>
            <span className='text-brand-component-text-gray text-lg'>
              {t('oops_something_went_wrong')}
            </span>
          </div>
          <div className='flex justify-center'>
            <Button className='h-12'>
              <Link href='/'>{t('back_to_spacedf')}</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-full'>
        <div className='w-full text-center mb-4'>
          <span className='text-brand-component-text-gray text-sm leading-7 font-normal'>
            {t('powered_by')}{' '}
            <span className='text-brand-component-text-dark font-bold'>
              SpaceDF
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
