import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Fingerprint, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useMemo } from 'react';
import { Control, UseFieldArrayRemove } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { QRCode, Trash } from '@/components/icons';
import { Checkbox } from '@/components/ui/checkbox';
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
import { DeviceModelCombobox } from '@/containers/devices/components/add-device-modal/components/device-model-combobox';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';

import { countTwoDigitNumbers, normalizeEUIInput } from '@/utils/format-eui';

interface EUIFieldProps {
  control: Control<EUIDevice>;
  name: `eui.${number}.dev_eui` | `eui.${number}.join_eui`;
  placeholder: string;
  icon?: JSX.Element;
  /** Renders the "n bytes" counter inside the input. */
  showByteCount?: boolean;
}

const EUIField = ({
  control,
  name,
  placeholder,
  icon,
  showByteCount,
}: EUIFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => {
      const byteLength = countTwoDigitNumbers(field.value);
      const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const nextValue = normalizeEUIInput(e.target.value);
        if (nextValue !== null) {
          field.onChange(nextValue);
        }
      };
      return (
        <FormItem>
          <FormControl>
            {icon || showByteCount ? (
              <InputWithIcon
                {...field}
                prefixCpn={icon}
                className={cn(showByteCount && 'pr-14', !icon && 'pl-3')}
                placeholder={placeholder}
                onChange={handleChange}
                suffixCpn={
                  showByteCount ? (
                    <p
                      className={cn(
                        'text-brand-component-text-negative font-semibold text-xs',
                        byteLength === 8 &&
                          'text-brand-component-text-positive',
                      )}
                    >
                      {byteLength} byte{byteLength > 1 ? 's' : ''}
                    </p>
                  ) : undefined
                }
              />
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                onChange={handleChange}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      );
    }}
  />
);

interface ColumnProps {
  t: ReturnType<typeof useTranslations>;
  remove: UseFieldArrayRemove;
  control: Control<EUIDevice>;
  fields: Array<EUIDevice['eui'][0] & { id: string }>;
}

export const useDeviceModelColumn = (
  props: ColumnProps,
): ColumnDef<EUIDevice['eui'][0] & { id: string }>[] => {
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
              name={`eui.${row.index}.device_model`}
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
        minSize: 220,
      },
      {
        accessorKey: 'dev_eui',
        header: () => <Label isRequired>Dev EUI</Label>,
        size: 198,
        minSize: 198,
        cell: ({ row }) => (
          <EUIField
            control={control}
            name={`eui.${row.index}.dev_eui`}
            placeholder='Dev EUI'
            icon={<Fingerprint size={16} className='text-brand-stroke-gray' />}
            showByteCount
          />
        ),
      },
      {
        accessorKey: 'join_eui',
        header: () => <Label isRequired>Join EUI</Label>,
        size: 198,
        minSize: 198,
        cell: ({ row }) => (
          <EUIField
            control={control}
            name={`eui.${row.index}.join_eui`}
            placeholder='Join EUI'
          />
        ),
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
                    prefixCpn={<QRCode className='text-brand-stroke-gray' />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ),
        size: 140,
        minSize: 140,
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
        size: 198,
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
                  Make this device public to share it on the map with all users
                  in your organization.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        cell: ({ row, table }) => (
          <FormField
            control={control}
            name={`eui.${row.index}.is_published`}
            render={({ field }) => (
              <FormItem
                className={cn(
                  'flex justify-center h-10 items-center',
                  table.getFilteredSelectedRowModel().rows.length > 0 &&
                    'justify-end mr-1.5',
                )}
              >
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />
        ),
        size: 140,
        minSize: 140,
      },
      {
        accessorKey: 'action',
        header: () => <p className='text-center'>{t('action')}</p>,
        size: 50,
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
