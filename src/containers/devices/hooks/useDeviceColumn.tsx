import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Check, ChevronDown, Eye, Fingerprint, Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { Control } from 'react-hook-form';

import { cn } from '@/lib/utils';

import { Pen } from '@/components/icons';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EuiDeviceTable } from '@/containers/devices/components/add-device-modal/validator';

import { Link } from '@/i18n/routing';
import { countTwoDigitNumbers, formatValueEUI } from '@/utils/format-eui';

import { NetworkServer, TableDevice } from '@/types';

type DeviceTableProps = EuiDeviceTable['eui'][0];

export const useDeviceColumn = (
  control: Control<EuiDeviceTable>,
  editDeviceIds: string[],
  isLoading: boolean,
  onEditDevice: (id: string) => void,
  onCancelEdit: (id: string) => void,
  networkServers: NetworkServer[],
  setSelectedEditDeviceId: (id: string) => void,
  handleSelectDeleteDevice: (index: number) => void,
  activeTab?: boolean,
): ColumnDef<TableDevice>[] => {
  const t = useTranslations('organization');
  const { slugName } = useParams<{
    slugName: string;
  }>();
  const isEdit = useCallback(
    (id: string) => {
      return editDeviceIds.includes(id);
    },
    [editDeviceIds],
  );

  const renderEUIField = useCallback(
    (
      row: Row<TableDevice>,
      fieldName: 'dev_eui' | 'join_eui',
      placeholder: string,
      icon?: JSX.Element,
    ) => {
      if (isLoading) {
        return <Skeleton className='w-full h-5' />;
      }
      return isEdit(row.original.id) ? (
        <FormField
          control={control}
          name={`eui.${row.index}.${fieldName}`}
          render={({ field }) => {
            const binaryLength = countTwoDigitNumbers(field.value);
            return (
              <FormItem>
                <FormControl>
                  <InputWithIcon
                    prefixCpn={icon}
                    className={cn('pr-14', !icon && 'pl-3')}
                    placeholder={placeholder}
                    {...field}
                    value={field.value}
                    onChange={(e) => {
                      const rawValue = e.target.value
                        .replace(/\s/g, '')
                        .toUpperCase();
                      const binaryValue = formatValueEUI(rawValue);
                      if (
                        /^[0-9A-Fa-f]*$/.test(rawValue) &&
                        countTwoDigitNumbers(binaryValue) <= 8 &&
                        binaryValue.split(' ').length <= 8
                      ) {
                        field.onChange(binaryValue);
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
                        {binaryLength} byte{binaryLength > 1 ? 's' : ''}
                      </p>
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      ) : (
        <div className='h-10 flex flex-col justify-center'>
          <span className='text-brand-component-text-gray text-xs font-medium'>
            {formatValueEUI(row.original[fieldName])}
          </span>
        </div>
      );
    },
    [control, isEdit, isLoading],
  );

  const renderTextField = useCallback(
    (
      row: Row<TableDevice>,
      fieldName: keyof Omit<DeviceTableProps, 'is_published'>,
      placeholder: string,
      icon?: JSX.Element,
    ) => {
      if (isLoading) {
        return <Skeleton className='w-full h-5' />;
      }
      return isEdit(row.original.id) ? (
        <FormField
          control={control}
          name={`eui.${row.index}.${fieldName}`}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {icon ? (
                  <InputWithIcon
                    prefixCpn={icon}
                    placeholder={placeholder}
                    {...field}
                  />
                ) : (
                  <Input
                    className='border-none h-10'
                    placeholder={placeholder}
                    {...field}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <div className='h-10 flex flex-col justify-center'>
          <span className='text-brand-component-text-gray text-base font-medium'>
            {row.original[fieldName] as string}
          </span>
        </div>
      );
    },
    [control, isEdit, isLoading],
  );

  const columns: (ColumnDef<TableDevice> & { accessorKey: string })[] = useMemo(
    () => [
      {
        accessorKey: 'dev_eui',
        header: 'Dev EUI',
        cell: ({ row }) => {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          return renderEUIField(
            row,
            'dev_eui',
            'Dev EUI',
            <Fingerprint size={16} className='text-brand-stroke-gray' />,
          );
        },
        size: 198,
      },
      {
        accessorKey: 'join_eui',
        header: 'Join EUI',
        cell: ({ row }) => {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          return renderEUIField(row, 'join_eui', 'Join EUI');
        },
        size: 198,
      },
      {
        accessorKey: 'claim_code',
        header: 'Claim Code',
        cell: ({ row }) => {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          return renderTextField(row, 'claim_code', 'Claim Code');
        },
        size: 198,
      },
      {
        accessorKey: 'app_key',
        header: 'App Key',
        cell: ({ row }) => {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          return renderTextField(row, 'app_key', 'App Key');
        },
        size: 198,
      },
      {
        accessorKey: 'network_server',
        header: 'Integrated API',
        cell: ({ row }) => {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          if (isEdit(row.original.id)) {
            return (
              <FormField
                control={control}
                name={`eui.${row.index}.network_server`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className='w-full bg-brand-component-fill-dark-soft h-10'
                          icon={<ChevronDown className='size-4 opacity-50' />}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {networkServers.map((server) => (
                              <SelectItem key={server.id} value={server.id}>
                                <div className='flex items-center space-x-2'>
                                  <Image
                                    src={server.logo}
                                    alt={server.name}
                                    width={16}
                                    height={16}
                                    className='rounded-md object-cover flex justify-center items-center'
                                  />
                                  <span className='text-brand-component-text-gray text-xs font-semibold'>
                                    {server.name}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }
          return (
            <div className='h-10 flex flex-col justify-center'>
              <div className='flex items-center space-x-2'>
                <Image
                  src={row.original.network_server.logo}
                  alt={row.original.network_server.name}
                  width={16}
                  height={16}
                  className='rounded-md object-cover flex justify-center items-center'
                />
                <span className='text-brand-component-text-gray text-xs font-semibold'>
                  {row.original.network_server.name}
                </span>
              </div>
            </div>
          );
        },
        size: 198,
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
        cell: ({ row }) => (
          <FormField
            control={control}
            name={`eui.${row.index}.is_published`}
            render={({ field }) => (
              <FormItem className='flex justify-center h-10 items-center'>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading || !isEdit(row.original.id)}
                />
              </FormItem>
            )}
          />
        ),
        minSize: 198,
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell({ getValue }) {
          if (isLoading) {
            return <Skeleton className='w-full h-5' />;
          }
          return (
            <div className='h-10 flex flex-col justify-center'>
              {getValue() === 'active' && (
                <span className='text-brand-component-text-positive font-medium'>
                  Active
                </span>
              )}
              {getValue() === 'inactive' && (
                <span className='text-brand-component-text-negative font-medium'>
                  Inactive
                </span>
              )}
              {getValue() === 'in_inventory' && (
                <span className='text-brand-component-text-secondary font-medium'>
                  In Inventory
                </span>
              )}
            </div>
          );
        },
        size: 108,
      },
      {
        accessorKey: 'action',
        header: () => <div className='flex justify-center'>{t('action')}</div>,
        cell({ row }) {
          return (
            <FormField
              control={control}
              name={`eui.${row.index}.claim_code`}
              render={({ formState }) => {
                const isDisabled =
                  !!formState.errors.eui?.[row.index] ||
                  !formState.dirtyFields.eui?.[row.index];
                return (
                  <div className='flex items-center justify-center space-x-2'>
                    {isEdit(row.original.id) ? (
                      <>
                        <button
                          className='border border-brand-component-stroke-dark-soft rounded-lg p-2 disabled:opacity-55'
                          disabled={isDisabled}
                          onClick={() =>
                            setSelectedEditDeviceId(row.original.id)
                          }
                        >
                          <Check className='size-4 text-brand-component-text-positive' />
                        </button>
                        <button
                          className='border border-brand-component-stroke-dark-soft rounded-lg p-2'
                          onClick={() => onCancelEdit(row.original.id)}
                        >
                          <X className='size-4 text-brand-component-text-negative' />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/devices/${row.original.id}`}
                          className='border border-brand-component-stroke-dark-soft rounded-lg p-2 disabled:opacity-55'
                        >
                          <Eye className='size-4 text-brand-fill-outermost' />
                        </Link>
                        <button
                          className='border border-brand-component-stroke-dark-soft rounded-lg p-2'
                          onClick={() => onEditDevice(row.original.id)}
                          disabled={isLoading}
                        >
                          <Pen className='size-4 text-brand-fill-outermost' />
                        </button>
                        <button
                          className='border border-brand-component-stroke-dark-soft rounded-lg p-2'
                          disabled={isLoading}
                          onClick={() => handleSelectDeleteDevice(row.index)}
                        >
                          <Trash className='size-4 text-brand-fill-outermost' />
                        </button>
                      </>
                    )}
                  </div>
                );
              }}
            />
          );
        },
        size: 108,
      },
    ],
    [
      control,
      handleSelectDeleteDevice,
      isLoading,
      networkServers,
      onCancelEdit,
      onEditDevice,
      setSelectedEditDeviceId,
      isEdit,
      renderEUIField,
      renderTextField,
      slugName,
      t,
    ],
  );
  return columns.filter((column) => {
    if (activeTab) {
      return column.accessorKey !== 'public_device';
    }
    return true;
  });
};
