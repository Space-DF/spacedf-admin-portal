import { AlertTriangle, Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

import { AddDeviceResponse } from '../types';

interface Props {
  response?: AddDeviceResponse;
}

const AddDeviceSuccessModal: React.FC<Props> = ({ response }) => {
  const t = useTranslations('organization');

  if (!response) return null;

  const { total_created, total_failed } = response;

  const isPartialSuccess = total_created > 0 && total_failed > 0;
  const isAllFailed = total_created === 0;
  const isAllSuccess = total_failed === 0;

  const getTitle = () => {
    if (isAllFailed) return t('add_device_failed');
    if (isPartialSuccess) return t('partial_success');
    return t('congratulations');
  };

  const renderContent = () => {
    if (isAllSuccess) {
      return (
        <div className='flex w-full items-center gap-3 rounded-xl bg-green-50 p-3.5 text-green-700'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-green-700'>
            <Check size={16} strokeWidth={3} />
          </div>
          <p className='text-base font-semibold'>
            {total_created} {t('added_successfully_mockup')}
          </p>
        </div>
      );
    }

    if (isAllFailed) {
      return (
        <div className='flex w-full items-start gap-3 rounded-xl bg-amber-50 p-3.5 text-left transition-all'>
          <AlertTriangle size={32} className='shrink-0 text-amber-500' />
          <div className='space-y-1'>
            <p className='text-base font-bold text-brand-component-text-dark'>
              {total_failed} {t('devices_skipped_mockup')}
            </p>
            <p className='text-xs leading-relaxed text-brand-component-text-gray'>
              {t('skipped_description')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className='w-full space-y-3'>
        <div className='flex w-full items-center gap-3 rounded-xl bg-green-50 p-3.5 text-green-700'>
          <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-green-700'>
            <Check size={16} strokeWidth={3} />
          </div>
          <p className='text-base font-semibold'>
            {total_created} {t('added_successfully_mockup')}
          </p>
        </div>

        <div className='flex w-full items-start gap-3 rounded-xl bg-amber-50 p-4 text-left transition-all'>
          <AlertTriangle size={36} className='shrink-0 text-amber-500' />
          <div className='space-y-1'>
            <p className='text-base font-bold text-brand-component-text-dark'>
              {total_failed} {t('devices_skipped_mockup')}
            </p>
            <p className='text-xs leading-relaxed text-brand-component-text-gray'>
              {t('skipped_description')}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className='w-full space-y-6 pb-2 pt-1'>
      <div className='flex flex-col items-center justify-center space-y-4 text-center'>
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-colors ${
            isAllFailed ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {isAllFailed ? (
            <X size={32} className='text-white' strokeWidth={1.5} />
          ) : (
            <Check size={32} className='text-white' strokeWidth={3} />
          )}
        </div>

        <h2 className='text-xl font-bold tracking-tight text-brand-component-text-dark'>
          {getTitle()}
        </h2>
      </div>

      <div className='flex flex-col items-center'>{renderContent()}</div>
    </div>
  );
};

export default memo(AddDeviceSuccessModal);
