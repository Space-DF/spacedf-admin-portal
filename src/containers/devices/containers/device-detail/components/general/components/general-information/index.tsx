import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Pen } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CopiedButton from '@/containers/devices/containers/device-detail/components/general/components/copied-button';
import {
  generalInformationFormSchema,
  GeneralInformationFormValues,
} from '@/containers/devices/containers/device-detail/components/general/schema';
import { useDevice } from '@/containers/devices/containers/device-detail/hooks/useDevice';
import { useUpdateDevice } from '@/containers/devices/containers/device-detail/hooks/useUpdateDevice';

const GeneralInformation = () => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<GeneralInformationFormValues>({
    resolver: zodResolver(generalInformationFormSchema),
  });

  const { trigger: updateDevice, isMutating: isUpdating } = useUpdateDevice();

  const { data: deviceDetail, mutate: mutateDevice } = useDevice();

  const t = useTranslations('device-detail');

  useEffect(() => {
    if (deviceDetail) {
      form.reset({
        deviceId: deviceDetail.id,
        createdAt: dayjs(deviceDetail.created_at).format(
          'MMM D, YYYY - HH:mm:ss',
        ),
        description: deviceDetail.description,
      });
    }
  }, [deviceDetail]);

  const onSubmit = async (data: GeneralInformationFormValues) => {
    await updateDevice({
      description: data.description,
    });
    mutateDevice();
    setIsEditing(false);
  };

  return (
    <Form {...form}>
      <form className='space-y-3' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between'>
          <p className='text-lg font-semibold'>{t('general_information')}</p>
          {isEditing ? (
            <div className='flex items-center gap-1'>
              <Button
                type='button'
                size='sm'
                variant='outline'
                className='flex items-center gap-1'
                onClick={() => setIsEditing(false)}
              >
                <X className='size-4' />
                {t('cancel')}
              </Button>
              <Button
                size='sm'
                className='flex items-center gap-1'
                loading={isUpdating}
              >
                <Save className='size-4' />
                {t('save')}
              </Button>
            </div>
          ) : (
            <Button
              className='flex items-center gap-1'
              type='button'
              onClick={() => setIsEditing(true)}
            >
              <Pen width={16} height={16} />
              {t('edit')}
            </Button>
          )}
        </div>
        <div className='space-y-3'>
          <FormField
            control={form.control}
            name='deviceId'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs text-brand-component-text-gray font-semibold'>
                  {t('device_id')}
                </FormLabel>
                <div className='flex justify-between items-center space-x-2'>
                  <FormControl>
                    <Input {...field} disabled className='h-10' />
                  </FormControl>
                  <CopiedButton
                    className='text-brand-component-text-gray w-14 justify-center flex'
                    value={field.value}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='createdAt'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs text-brand-component-text-gray font-semibold'>
                  {t('created_at')}
                </FormLabel>
                <FormControl>
                  <Input {...field} disabled className='h-10' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-xs text-brand-component-text-gray font-semibold'>
                  {t('description')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    className='w-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft px-3 py-2 text-sm outline-none'
                    placeholder='Device description'
                    readOnly={!isEditing}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default GeneralInformation;
