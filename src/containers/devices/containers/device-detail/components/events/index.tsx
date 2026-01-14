'use client';

import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { useDeviceEvents } from '@/containers/devices/hooks/useDeviceEvents';

const formatTimestamp = (timestamp: string) => {
  const parsed = dayjs(timestamp);
  if (!parsed.isValid()) {
    return timestamp;
  }

  return parsed.format('HH:mm:ss');
};

const EventsTab = () => {
  const t = useTranslations('device-detail');
  const { deviceId } = useParams<{ deviceId: string }>();
  const { data: events = [], isLoading } = useDeviceEvents(deviceId);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <p className='text-sm text-brand-component-text-gray'>
          Loading events...
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      <p className='text-lg font-semibold'>{t('last_events')}</p>
      <Card className='border border-brand-component-stroke-dark-soft rounded-lg bg-brand-background-fill-surface'>
        <CardContent className='p-3'>
          {events.length === 0 ? (
            <div className='py-8 text-center'>
              <p className='text-sm text-brand-component-text-gray'>
                {t('no_events')}
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {events.map((event, index) => (
                <div
                  key={index}
                  className='grid grid-cols-[auto_auto_1fr] items-center gap-x-8 text-base font-medium'
                >
                  <span className='text-brand-component-text-gray whitespace-nowrap'>
                    {formatTimestamp(event.timestamp)}
                  </span>
                  <span className='text-brand-component-text-dark min-w-0'>
                    [{event.latitude}, {event.longitude}]
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsTab;
