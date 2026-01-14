import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Fingerprint, KeyRound } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Control, UseFieldArrayRemove } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { Trash } from '@/components/icons';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';

import { countTwoDigitNumbers, formatValueEUI } from '@/utils/format-eui';

interface ColumnProps {
  t: ReturnType<typeof useTranslations>;
  remove: UseFieldArrayRemove;
  control: Control<EUIDevice>;
  fields: Array<EUIDevice['eui'][0] & { id: string }>;
}

export const getEUIColumns = (
  props: ColumnProps,
): ColumnDef<EUIDevice['eui'][0] & { id: string }>[] => {
  const { t, remove, control, fields } = props;

  return [
    {
      accessorKey: 'dev_eui',
      header: () => <Label isRequired>Dev EUI</Label>,
      minSize: 198,
      cell: ({ row }) => {
        return (
          <FormField
            control={control}
            name={`eui.${row.index}.dev_eui`}
            render={({ field }) => {
              const binaryLength = countTwoDigitNumbers(field.value);
              return (
                <FormItem>
                  <FormControl>
                    <InputWithIcon
                      prefixCpn={
                        <Fingerprint
                          size={16}
                          className='text-brand-stroke-gray'
                        />
                      }
                      className='pr-14'
                      {...field}
                      onChange={(e) => {
                        const rawValue = e.target.value
                          .replace(/\s/g, '')
                          .toUpperCase();
                        const binaryValue = formatValueEUI(rawValue);
                        const binaryLength = binaryValue.split(' ').length;
                        if (
                          /^[0-9A-Fa-f]*$/.test(rawValue) &&
                          countTwoDigitNumbers(binaryValue) <= 8 &&
                          binaryLength <= 8
                        ) {
                          field.onChange(formatValueEUI(rawValue));
                        }
                      }}
                      suffixCpn={
                        <p
                          className={cn(
                            'text-brand-component-text-negative font-semibold text-xs',
                            binaryLength === 8 &&
                              'text-brand-component-text-positive',
                          )}
                        >
                          {binaryLength} byte
                          {Number(binaryLength) > 1 ? 's' : ''}
                        </p>
                      }
                      placeholder='Dev EUI'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        );
      },
    },
    {
      accessorKey: 'join_eui',
      header: () => <Label isRequired>Join EUI</Label>,
      minSize: 198,
      cell: ({ row }) => {
        return (
          <FormField
            control={control}
            name={`eui.${row.index}.join_eui`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/\s/g, '')
                        .toUpperCase();
                      const binaryValue = formatValueEUI(rawValue);
                      const binaryLength = binaryValue.split(' ').length;
                      if (
                        /^[0-9A-Fa-f]*$/.test(rawValue) &&
                        countTwoDigitNumbers(binaryValue) <= 8 &&
                        binaryLength <= 8
                      ) {
                        field.onChange(formatValueEUI(rawValue));
                      }
                    }}
                    placeholder='Join EUI'
                    className='border-none h-10'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      },
    },
    {
      accessorKey: 'claim_code',
      header: () => <Label>{t('claim_code')}</Label>,
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.claim_code`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  placeholder='Claim Code'
                  {...field}
                  className='px-3'
                  suffixCpn={
                    <Image
                      src='/images/qrcode.svg'
                      alt='qrcode'
                      width={18}
                      height={18}
                    />
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
      minSize: 198,
    },
    {
      accessorKey: 'app_key',
      header: () => <Label isRequired>{t('app_key')}</Label>,
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.app_key`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputWithIcon
                  placeholder='App Key'
                  {...field}
                  prefixCpn={
                    <KeyRound size={15} className='text-brand-icon-gray' />
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ),
      minSize: 198,
    },
    {
      accessorKey: 'public_device',
      header: () => (
        <div className='flex space-x-2 items-center justify-center'>
          <Label>{t('public_device')}</Label>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <QuestionMarkCircledIcon className='size-5 text-brand-icon-gray' />
                </span>
              </TooltipTrigger>
              <TooltipContent className='max-w-48 text-center leading-relaxed'>
                Make this device public to share it on the map with all users in
                your organization.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      cell: ({ row }) => (
        <FormField
          control={control}
          name={`eui.${row.index}.is_published`}
          render={({ field }) => (
            <FormItem className='flex justify-center h-10 items-center'>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormItem>
          )}
        />
      ),
      minSize: 198,
    },
    {
      accessorKey: 'action',
      header: () => <p className='text-center'>{t('action')}</p>,
      size: 108,
      cell({ row }) {
        return (
          <div className='flex justify-center'>
            <button
              className='border border-brand-component-stroke-dark-soft rounded-lg p-2'
              onClick={() => {
                const fieldIndex = fields.findIndex(
                  (field) => field.id === row.id,
                );
                if (fieldIndex !== -1) {
                  remove(fieldIndex);
                }
              }}
            >
              <Trash
                width={16}
                height={16}
                className='text-brand-stroke-gray'
              />
            </button>
          </div>
        );
      },
    },
  ];
};
