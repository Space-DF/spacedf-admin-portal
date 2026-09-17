import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowUpRight, Clock, Globe, House, Send, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

dayjs.extend(relativeTime);

interface Props {
  currentPage: string;
  preview: React.ReactNode;
  onSubmit?: () => void;
  onDiscard?: () => void;
  isLoading?: boolean;
  isDirty?: boolean;
  domain?: string;
  lastUpdatedAt?: string;
}

export const PreviewWhiteLabel: React.FC<Props> = ({
  currentPage,
  preview,
  onSubmit,
  onDiscard,
  isLoading = false,
  isDirty,
  domain,
  lastUpdatedAt,
}) => {
  const t = useTranslations('white-label');

  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const isPublishingRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      isPublishingRef.current = true;
    } else if (isPublishingRef.current) {
      isPublishingRef.current = false;
      setIsPublishOpen(false);
    }
  }, [isLoading]);

  return (
    <div className='flex-1 flex flex-col h-full bg-[#E6E6E6] relative overflow-hidden'>
      <div
        className='absolute inset-0 z-0 pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(#EFEFEF 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
        }}
      />

      <div className='h-14 shrink-0 flex items-center justify-between px-3 z-10'>
        <Breadcrumb>
          <BreadcrumbList className='gap-0 sm:gap-0'>
            <BreadcrumbItem>
              <BreadcrumbLink
                href='/organizations'
                className='text-brand-component-text-gray-fixed font-medium flex items-center gap-x-1 text-[14px]'
              >
                <House className='size-4' />
                {t('organization_list')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className='text-brand-component-text-dark font-bold text-[14px]'>
                {currentPage}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {onSubmit && onDiscard && (
          <div className='flex gap-2'>
            <Button
              onClick={onDiscard}
              disabled={isLoading || !isDirty}
              prefixCpn={<X className='size-4' />}
              variant='outline'
              className='h-8 border border-brand-stroke-dark-soft text-brand-text-dark hover:bg-brand-fill-dark-soft font-semibold text-xs px-3.5 rounded-lg flex items-center gap-2 transition-all shadow-sm'
            >
              <span>{t('discard')}</span>
            </Button>

            <Popover open={isPublishOpen} onOpenChange={setIsPublishOpen}>
              <PopoverTrigger asChild>
                <Button
                  disabled={isLoading}
                  prefixCpn={<Send className='size-4' />}
                  className='h-8 font-semibold text-xs px-3.5 rounded-lg flex items-center gap-2 transition-all shadow-sm'
                >
                  <span>{t('publish')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align='end'
                sideOffset={8}
                className='w-72 rounded-xl p-4 shadow-lg'
              >
                <div className='space-y-3 '>
                  <div className='flex items-start justify-between gap-2 text-brand-component-text-secondary'>
                    <a
                      href={
                        domain
                          ? domain.startsWith('http')
                            ? domain
                            : `https://${domain}`
                          : ''
                      }
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex items-center gap-1.5 text-sm font-semibold hover:underline truncate'
                    >
                      <Globe className='size-4 shrink-0' />
                      <span className='truncate'>{domain || '—'}</span>
                    </a>
                    {domain && (
                      <a
                        href={
                          domain.startsWith('http')
                            ? domain
                            : `https://${domain}`
                        }
                        target='_blank'
                        rel='noopener noreferrer'
                        className='shrink-0 text-brand-component-text-gray hover:text-brand-component-text-dark transition-colors'
                      >
                        <ArrowUpRight className='size-4 text-brand-component-text-secondary' />
                      </a>
                    )}
                  </div>

                  <div className='space-y-1'>
                    <p className='text-xs text-brand-component-text-gray'>
                      {t('last_updated')}
                    </p>
                    <div className='flex items-center gap-1.5 text-sm font-medium text-brand-component-text-dark'>
                      <Clock className='size-3.5' />
                      <span>
                        {lastUpdatedAt ? dayjs(lastUpdatedAt).fromNow() : '—'}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => onSubmit?.()}
                    disabled={isLoading || !isDirty}
                    loading={isLoading}
                    className='w-full h-9 font-semibold text-sm rounded-lg flex items-center justify-center gap-2'
                  >
                    <span>{t('update')}</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
      {preview}
    </div>
  );
};
