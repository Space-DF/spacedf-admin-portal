import { CircleUser } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

import { SettingIcon } from '@/components/icons';
import DeleteAccount from '@/components/layouts/components/account-settings/components/delete-account';
import Language from '@/components/layouts/components/account-settings/components/language';
import Privacy from '@/components/layouts/components/account-settings/components/privacy';
import Profile from '@/components/layouts/components/account-settings/components/profile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

const SETTINGS = [
  {
    key: 'profile',
    icon: <CircleUser size={16} />,
    label: 'Profile',
  },
  {
    key: 'privacy',
    icon: <SettingIcon />,
    label: 'Privacy',
  },
  // {
  //   key: 'language',
  //   icon: <Globe size={16} />,
  //   label: 'Language Settings',
  // },
  // {
  //   key: 'delete_account',
  //   icon: <Trash size={16} />,
  //   label: 'Delete account',
  // },
];

interface Props {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const GeneralSetting = ({ isOpen, onOpenChange }: Props) => {
  const [currentSetting, setCurrentSetting] = useState('profile');
  const t = useTranslations('common');

  const renderSetting = useMemo(() => {
    switch (currentSetting) {
      case 'profile':
        return <Profile />;
      case 'privacy':
        return <Privacy />;
      case 'language':
        return <Language />;
      case 'delete_account':
        return <DeleteAccount />;
      default:
        return <></>;
    }
  }, [currentSetting]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='text-sm text-brand-text-dark sm:max-w-[800px] p-0'>
        <DialogHeader>
          <DialogTitle>{t('account_settings')}</DialogTitle>
        </DialogHeader>
        <div className='flex'>
          <div className='w-[200px] border-r border-brand-stroke-dark-soft py-4 dark:border-brand-stroke-outermost'>
            <div className='flex flex-col gap-1'>
              {SETTINGS.map((setting) => {
                const isActive = setting.key === currentSetting;

                return (
                  <React.Fragment key={setting.key}>
                    {setting.key === 'delete_account' && (
                      <Separator className='my-1.5' />
                    )}
                    <div
                      className={cn(
                        'flex cursor-pointer items-center gap-2 px-4 py-[6px] font-medium duration-300 hover:bg-brand-fill-dark-soft/80 hover:dark:bg-brand-text-dark/80',
                        isActive
                          ? 'border-r-2 border-black bg-brand-fill-dark-soft dark:border-brand-heading dark:bg-brand-text-dark dark:text-white'
                          : 'border-none bg-transparent text-brand-text-gray',
                        {
                          'text-brand-semantic-accent':
                            setting.key === 'delete_account',
                        },
                      )}
                      onClick={() => setCurrentSetting(setting.key)}
                    >
                      {setting.icon}
                      {t(setting.key)}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div
            className={cn(
              'min-h-[350px] flex-1 p-4',
              currentSetting === 'appearance' &&
                'bg-brand-fill-surface dark:bg-brand-fill-outermost',
            )}
          >
            <div className='text-brand-text-dark dark:text-brand-dark-text-gray'>
              {renderSetting}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralSetting;
