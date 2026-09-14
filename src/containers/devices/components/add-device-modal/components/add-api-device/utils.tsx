import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Fingerprint } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Control, UseFieldArrayRemove } from 'react-hook-form';

import { QRCode, Trash } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DeviceModelCombobox } from '@/containers/devices/components/add-device-modal/components/device-model-combobox';
import { ApiDevice } from '@/containers/devices/components/add-device-modal/validator';

type ApiDeviceRow = ApiDevice['api_devices'][0] & { id: string };

interface ColumnProps {
  t: ReturnType<typeof useTranslations>;
  remove: UseFieldArrayRemove;
  control: Control<ApiDevice>;
  fields: ApiDeviceRow[];
}

const HeaderTooltip = ({ content }: { content: string }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <QuestionMarkCircledIcon className='size-5 text-brand-icon-gray' />
        </span>
      </TooltipTrigger>
      <TooltipContent className='max-w-48 text-center leading-relaxed'>
        {content}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export const useApiDeviceColumn = (
  props: ColumnProps,
): ColumnDef<ApiDeviceRow>[] => {
  const { t, remove, control, fields } = props;
  return useMemo(
    () => [
      {
        id: 'device_model',
        header: ({ table }) => (
          <div className='flex items-center gap-2'>
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label={t('select_all')}
            />
            <Label isRequired>{t('device_model')}</Label>
          </div>
        ),
        cell: ({ row }) => (
          <div className='flex items-start gap-2'>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={t('select_row')}
              className='mt-2.5'
            />
            <FormField
              control={control}
              name={`api_devices.${row.index}.device_model`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormControl>
                    <DeviceModelCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('select_device_model')}
                      contentClassName='w-[var(--radix-popover-trigger-width)]'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ),
        size: 340,
        minSize: 340,
      },
      {
        accessorKey: 'serial_number',
        header: () => (
          <div className='flex items-center gap-2'>
            <Label>{t('serial_number')}</Label>
            <HeaderTooltip content={t('serial_number_tooltip')} />
          </div>
        ),
        cell: ({ row }) => (
          <FormField
            control={control}
            name={`api_devices.${row.index}.serial_number`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    {...field}
                    placeholder={t('auto_generate')}
                    prefixCpn={
                      <Fingerprint
                        size={16}
                        className='text-brand-stroke-gray'
                      />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ),
        size: 280,
        minSize: 280,
      },
      {
        accessorKey: 'claim_code',
        header: () => <Label>{t('claim_code')}</Label>,
        cell: ({ row }) => (
          <FormField
            control={control}
            name={`api_devices.${row.index}.claim_code`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    {...field}
                    placeholder={t('claim_code')}
                    prefixCpn={<QRCode className='text-brand-stroke-gray' />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ),
        size: 280,
        minSize: 280,
      },
      {
        accessorKey: 'is_published',
        header: () => (
          <div className='flex items-center justify-center gap-2'>
            <Label>{t('publish_device')}</Label>
            <HeaderTooltip content={t('publish_device_tooltip')} />
          </div>
        ),
        cell: ({ row }) => (
          <FormField
            control={control}
            name={`api_devices.${row.index}.is_published`}
            render={({ field }) => (
              <FormItem className='flex h-10 items-center justify-center'>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />
        ),
        size: 280,
        minSize: 280,
      },
      {
        accessorKey: 'action',
        header: () => <p className='text-center'>{t('action')}</p>,
        size: 100,
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
    ],
    [t, remove, control, fields],
  );
};
