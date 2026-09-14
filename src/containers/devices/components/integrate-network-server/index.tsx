import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { Copy, CopyCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';

import { InfoOutline } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { getOrganizationApiUrl } from '@/utils';

interface Props {
  networkServerName: string;
}

type TtnEventTypeKey =
  | 'uplink_message'
  | 'normalized_uplink'
  | 'join_accept'
  | 'downlink_ack';

type TtnEventTypeDescriptionKey = `${TtnEventTypeKey}_description`;

const ttnEventTypeOrder: TtnEventTypeKey[] = [
  'uplink_message',
  'normalized_uplink',
  'join_accept',
  'downlink_ack',
];

const DEFAULT_TTN_PATH = '/ttn/http';

const ttnEventTypes = {
  uplink_message: DEFAULT_TTN_PATH,
  normalized_uplink: DEFAULT_TTN_PATH,
  join_accept: DEFAULT_TTN_PATH,
  downlink_ack: DEFAULT_TTN_PATH,
};

export const IntegrateNetworkServer: FC<Props> = ({ networkServerName }) => {
  const t = useTranslations('device-detail');
  const [isCopied, setIsCopied] = useState(false);
  const [isBaseCopied, setIsBaseCopied] = useState(false);
  const { slugName } = useParams<{ slugName: string }>();
  const organizationApiUrl = getOrganizationApiUrl(slugName || '');
  const lorawanPath = `${networkServerName.toLowerCase()}/http`;
  const lorawanUrl = `${organizationApiUrl}${lorawanPath}`;
  const isTTNNetwork = networkServerName.toLowerCase().includes('ttn');

  const [ttnCopied, setTtnCopied] = useState<Record<TtnEventTypeKey, boolean>>({
    uplink_message: false,
    normalized_uplink: false,
    join_accept: false,
    downlink_ack: false,
  });

  const handleCopy = async (value: string, setCopied: (v: boolean) => void) => {
    setCopied(true);
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setCopied(false);
    }
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center space-x-3'>
        <span className='text-brand-component-text-dark text-[16px] font-semibold leading-6'>
          {t('integrate')} {networkServerName}{' '}
        </span>
        <QuestionMarkCircledIcon className='size-4 text-brand-icon-gray' />
      </div>

      <div className='space-y-2'>
        {isTTNNetwork ? (
          <Card className='p-4 sm:p-5'>
            <div className='space-y-5'>
              <div className='space-y-2'>
                <span className='text-sm text-brand-component-text-gray font-medium'>
                  {t('base_url')}
                </span>
                <div className='flex items-center gap-2'>
                  <Input
                    readOnly
                    value={organizationApiUrl}
                    className='h-12 flex-1'
                  />
                  <Button
                    className='space-x-2 flex items-center h-12 w-28 shrink-0'
                    onClick={() =>
                      handleCopy(organizationApiUrl, setIsBaseCopied)
                    }
                    disabled={isBaseCopied}
                  >
                    <span>{t(isBaseCopied ? 'copied' : 'copy')}</span>
                    {isBaseCopied ? (
                      <CopyCheck size={20} />
                    ) : (
                      <Copy size={20} />
                    )}
                  </Button>
                </div>
              </div>

              <div className='space-y-2'>
                <div>
                  <span className='text-sm text-brand-component-text-gray font-medium'>
                    {t('enabled_event_types')}
                  </span>
                  <p className='text-sm text-brand-component-text-gray/80'>
                    {t('enabled_event_types_description')}
                  </p>
                </div>

                <TooltipProvider delayDuration={0}>
                  <div className='space-y-1'>
                    {ttnEventTypeOrder.map((key) => {
                      const path = ttnEventTypes[key];
                      const isEventCopied = ttnCopied[key];
                      const description = t(
                        `${key}_description` as TtnEventTypeDescriptionKey,
                      );

                      return (
                        <div
                          key={key}
                          className='grid grid-cols-1 gap-3 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-brand-component-stroke-dark-soft hover:bg-brand-component-fill-light sm:grid-cols-[minmax(0,240px)_1fr_auto] sm:items-center'
                        >
                          <div className='flex items-center gap-2 min-w-0'>
                            <span className='truncate text-sm font-medium text-brand-component-text-dark'>
                              {t(key)}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type='button'
                                  className='inline-flex items-center rounded-md p-1 text-brand-icon-gray/90 transition-colors hover:bg-brand-component-fill-dark-soft hover:text-brand-component-text-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                                  aria-label={description}
                                >
                                  <InfoOutline className='size-4' />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className='max-w-80 leading-relaxed'>
                                {description}
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <Input
                            readOnly
                            value={path}
                            className='h-12 w-full sm:min-w-0'
                          />

                          <Button
                            className='space-x-2 flex items-center h-12 w-28 justify-center'
                            onClick={() =>
                              handleCopy(path, (v) =>
                                setTtnCopied((prev) => ({ ...prev, [key]: v })),
                              )
                            }
                            disabled={isEventCopied}
                          >
                            <span>{t(isEventCopied ? 'copied' : 'copy')}</span>
                            {isEventCopied ? (
                              <CopyCheck size={20} />
                            ) : (
                              <Copy size={20} />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        ) : (
          <Card className='p-4 sm:p-5'>
            <div className='flex items-center gap-2'>
              <Input readOnly value={lorawanUrl} className='h-12 flex-1' />
              <Button
                className='space-x-2 flex items-center h-12 w-28 shrink-0'
                onClick={() => handleCopy(lorawanUrl, setIsCopied)}
                disabled={isCopied}
              >
                <span>{t(isCopied ? 'copied' : 'copy')}</span>
                {isCopied ? <CopyCheck size={20} /> : <Copy size={20} />}
              </Button>
            </div>
          </Card>
        )}

        <div className='flex space-x-2 items-center text-base leading-5'>
          <span className='text-brand-component-text-gray font-medium'>
            {t('configure_lorawan_network')}
          </span>
          <span className='text-brand-component-text-dark-hover font-semibold'>
            {t('check_our_guideline')}
          </span>
        </div>
      </div>
    </div>
  );
};
