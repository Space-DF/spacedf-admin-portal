import { zodResolver } from '@hookform/resolvers/zod';
import {
  CircleCheck,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Save,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';

import { Pen } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { SelectNetwork } from '@/containers/devices/containers/device-detail/components/general/components/activation-information/components/select-network';
import CopiedButton from '@/containers/devices/containers/device-detail/components/general/components/copied-button';
import {
  activationInformationFormSchema,
  ActivationInformationFormValues,
} from '@/containers/devices/containers/device-detail/components/general/schema';
import { useDevice } from '@/containers/devices/containers/device-detail/hooks/useDevice';
import { useUpdateDevice } from '@/containers/devices/containers/device-detail/hooks/useUpdateDevice';

import { formatValueEUI, normalizeEUIInput } from '@/utils';

import { NetworkServer } from '@/types';

const DEFAULT_VALUES = {
  devEui: '',
  joinEui: '',
  appKey: '',
  description: '',
};

interface Props {
  deviceId: string;
}

const ActivationInformation = ({ deviceId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<ActivationInformationFormValues>({
    resolver: zodResolver(activationInformationFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const [showAppKey, setShowAppKey] = useState(false);
  const { reset } = form;
  const [networkServer, setNetworkServer] = useState<NetworkServer>();

  const t = useTranslations('device-detail');
  const {
    data: deviceDetail,
    refetch: mutateDevice,
    isLoading: isLoadingDevice,
  } = useDevice(deviceId);

  useEffect(() => {
    if (deviceDetail) {
      reset({
        devEui: formatValueEUI(deviceDetail.lorawan_device?.dev_eui),
        joinEui: formatValueEUI(deviceDetail.lorawan_device?.join_eui),
        appKey: deviceDetail.lorawan_device?.app_key,
        description: deviceDetail.description,
      });
      setNetworkServer(deviceDetail.lorawan_device?.network_server);
    }
  }, [deviceDetail, reset]);

  const { mutateAsync: updateDevice, isPending: isUpdating } =
    useUpdateDevice(deviceId);

  const onSubmit = async (data: ActivationInformationFormValues) => {
    const dirtyFields = Object.keys(form.formState.dirtyFields);
    await updateDevice(
      dirtyFields.includes('devEui')
        ? {
            dev_eui: data.devEui.replace(/\s/g, ''),
            join_eui: data.joinEui.replace(/\s/g, ''),
            app_key: data.appKey,
            description: data.description,
            network_server: networkServer,
          }
        : {
            join_eui: data.joinEui.replace(/\s/g, ''),
            app_key: data.appKey,
            description: data.description,
            network_server: networkServer,
          },
    );
    mutateDevice();
    setIsEditing(false);
  };

  const handleChangeField = (
    field: ControllerRenderProps<
      ActivationInformationFormValues,
      'devEui' | 'joinEui'
    >,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextValue = normalizeEUIInput(e.target.value);
    if (nextValue !== null) {
      field.onChange(nextValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
    setNetworkServer(deviceDetail?.lorawan_device?.network_server);
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
                onClick={handleCancel}
                prefixCpn={<X className='size-4' />}
                className='flex items-center gap-1'
              >
                {t('cancel')}
              </Button>
              <Button
                size='sm'
                className='flex items-center gap-1'
                loading={isUpdating}
                prefixCpn={<Save className='size-4' />}
              >
                {t('save')}
              </Button>
            </div>
          ) : (
            <Button
              className='flex items-center gap-2'
              size='sm'
              variant='outline'
              onClick={() => setIsEditing(true)}
              type='button'
            >
              <Pen className='size-4' />
              {t('edit')}
            </Button>
          )}
        </div>

        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='devEui'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-semibold text-brand-component-text-dark'>
                  {t('dev_eui')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isEditing}
                      className='pl-9 pr-9'
                      onChange={(e) => handleChangeField(field, e)}
                    />
                  </FormControl>
                  <Fingerprint className='size-4 absolute left-2 top-1/2 -translate-y-1/2 text-brand-stroke-gray' />
                  <CopiedButton value={field.value} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='joinEui'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-semibold text-brand-component-text-dark'>
                  {t('join_eui')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isEditing}
                      className='pr-9'
                      onChange={(e) => handleChangeField(field, e)}
                    />
                  </FormControl>
                  <CopiedButton value={field.value} />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='appKey'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-sm font-semibold text-brand-component-text-dark'>
                  {t('app_key')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      type={showAppKey ? 'text' : 'password'}
                      readOnly={!isEditing}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className='pl-9 pr-20'
                    />
                  </FormControl>
                  <span className='absolute left-2 top-1/2 -translate-y-1/2'>
                    <KeyRound className='size-4 text-brand-icon-gray' />
                  </span>
                  <div className='absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center gap-2 rounded-r-lg h-8'>
                    <div className='h-full grid grid-cols-2 gap-x-1 text-brand-component-text-gray justify-center w-full'>
                      <button
                        type='button'
                        className='size-8 flex items-center justify-center rounded-lg bg-brand-component-fill-light border border-brand-component-stroke-dark-soft'
                        onClick={() => setShowAppKey((v) => !v)}
                      >
                        {showAppKey ? (
                          <EyeOff className='size-4' />
                        ) : (
                          <Eye className='size-4' />
                        )}
                      </button>
                      <CopiedButton
                        value={field.value}
                        className='text-brand-component-text-gray rounded-lg bg-brand-component-fill-light border border-brand-component-stroke-dark-soft flex items-center justify-center'
                      />
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='space-y-3'>
          <FormLabel className='text-sm font-semibold text-brand-component-text-dark'>
            {t('integrated_api')}
          </FormLabel>
          <Card className='p-4 bg-brand-component-fill-dark-soft border-brand-component-stroke-dark-soft border'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='h-12 p-2 rounded-sm bg-brand-component-fill-light flex items-center'>
                  {isLoadingDevice || !networkServer?.logo ? (
                    <Skeleton className='h-5 w-20' />
                  ) : (
                    <Image
                      src={networkServer?.logo || ''}
                      alt={networkServer?.name || ''}
                      width={90}
                      height={20}
                      className='object-contain h-5'
                    />
                  )}
                </div>
                <div className='space-y-0.5'>
                  <p className='text-sm font-medium'>{networkServer?.name}</p>
                  <div className='bg-brand-component-fill-positive-soft border-brand-component-stroke-positive-soft text-brand-component-text-positive px-2 py-1 flex gap-0.5 text-xs font-semibold rounded border'>
                    <CircleCheck className='text-brand-icon-positive size-4' />
                    {t('uplink_configured')}
                  </div>
                </div>
              </div>
              <SelectNetwork
                isEditing={isEditing}
                networkServer={networkServer}
                setNetworkServer={setNetworkServer}
              />
            </div>
          </Card>
        </div>
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-semibold text-brand-component-text-dark'>
                {t('description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  className='w-full rounded-xl border border-brand-component-stroke-dark-soft px-3 py-2 text-sm outline-none read-only:cursor-default read-only:bg-brand-component-fill-disabled read-only:text-brand-component-text-dark'
                  placeholder='Device description'
                  readOnly={!isEditing}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ActivationInformation;
