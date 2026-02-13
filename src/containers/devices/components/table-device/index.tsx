import { zodResolver } from '@hookform/resolvers/zod';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNetworkServer } from '@/containers/devices/components/add-device-modal/components/select-network-server/hooks/useNetworkServer';
import {
  EUIDevice,
  EuiDeviceTable,
  euiDeviceTableSchema,
} from '@/containers/devices/components/add-device-modal/validator';
import DialogDeleteDevice from '@/containers/devices/components/delete-device';
import DialogSaveDevice from '@/containers/devices/components/save-device';
import { useDeleteDevice } from '@/containers/devices/hooks/useDeleteDevice';
import { useDeviceColumn } from '@/containers/devices/hooks/useDeviceColumn';
import { useUpdateDevice } from '@/containers/devices/hooks/useUpdateDevice';

import { formatValueEUI } from '@/utils/format-eui';

import { TableDevice as TableDeviceType } from '@/types';

interface TableDeviceProps {
  devices: TableDeviceType[];
  isLoading: boolean;
  pageIndex: number;
  count: number;
  mutate: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  activeTab?: boolean;
}

const TableDevice: React.FC<TableDeviceProps> = ({
  devices,
  isLoading,
  pageIndex,
  count,
  mutate,
  onNextPage,
  onPrevPage,
  activeTab = false,
}) => {
  const form = useForm<EuiDeviceTable>({
    defaultValues: {
      eui: [],
    },
    resolver: zodResolver(euiDeviceTableSchema),
    mode: 'onChange',
  });

  const { data: networkResults } = useNetworkServer('', 1);
  const t = useTranslations('organization');

  const { trigger: updateDevice, isMutating: isUpdating } = useUpdateDevice();
  const networkServers = networkResults?.results || [];

  const [editDeviceIds, setEditDeviceIds] = useState<string[]>([]);
  const [selectedEditDeviceId, setSelectedEditDeviceId] = useState<string>();
  const [isOpenSaveDevice, setIsOpenSaveDevice] = useState(false);

  const [selectedDeleteDeviceIndex, setSelectedDeleteDeviceIndex] =
    useState<number>();
  const [isOpenDeleteDevice, setIsOpenDeleteDevice] = useState(false);

  const {
    control,
    formState: { defaultValues, dirtyFields },
    getValues,
    reset,
  } = form;

  const { trigger: deleteDevice, isMutating: isDeleting } = useDeleteDevice();

  const onEditDevice = useCallback((id: string) => {
    setEditDeviceIds((deviceIds) => {
      if (deviceIds.includes(id)) {
        return deviceIds.filter((deviceId) => deviceId !== id);
      }
      return [...deviceIds, id];
    });
  }, []);

  const onCancelEdit = useCallback(
    (id: string) => {
      onEditDevice(id);
      const currentIndex = defaultValues?.eui?.findIndex(
        (device) => device?.id === id,
      );
      if (
        currentIndex !== undefined &&
        currentIndex > -1 &&
        defaultValues?.eui?.[currentIndex]
      ) {
        form.resetField(`eui.${currentIndex}`);
      }
    },
    [defaultValues?.eui, onEditDevice],
  );

  const handleSelectEditDevice = useCallback((id: string) => {
    setSelectedEditDeviceId(id);
    setIsOpenSaveDevice(true);
  }, []);

  const handleSelectDeleteDevice = useCallback((index: number) => {
    setSelectedDeleteDeviceIndex(index);
    setIsOpenDeleteDevice(true);
  }, []);

  const columns = useDeviceColumn(
    control,
    editDeviceIds,
    isLoading,
    onEditDevice,
    onCancelEdit,
    networkServers,
    handleSelectEditDevice,
    handleSelectDeleteDevice,
    activeTab,
  );

  const table = useReactTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isDisabledPrevPage = pageIndex <= 0;
  const isDisabledNextPage =
    count === 0 || count ? pageIndex >= Math.ceil(count / 10) - 1 : false;

  const onRemoveRow = useCallback(
    async (index?: number) => {
      if (index === undefined || index < 0) return;
      const device = devices[index];
      if (!device) return;
      await deleteDevice({ id: device.id });
      mutate();
      setIsOpenDeleteDevice(false);
      setSelectedDeleteDeviceIndex(undefined);
    },
    [devices, deleteDevice, mutate],
  );

  const getDirtyValuesAtIndex = useCallback(
    (index: number) => {
      return Object.keys(dirtyFields.eui?.[index] || {}).reduce(
        (acc, key) => {
          if (key === 'dev_eui' || key === 'join_eui') {
            acc[key] = (
              getValues(`eui.${index}.${key}` as never) as unknown as string
            ).replace(/\s/g, '');
          } else {
            acc[key] = getValues(
              `eui.${index}.${key}` as never,
            ) as unknown as string;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    },
    [dirtyFields, getValues],
  );

  const onSaveDevice = useCallback(
    async (id: string) => {
      const values = getValues();
      const newDeviceIndex = values.eui.findIndex((device) => device.id === id);
      const newDevice = getDirtyValuesAtIndex(newDeviceIndex);
      if (!newDevice) return;
      await updateDevice(
        { ...newDevice, id },
        {
          onError: (error) => {
            const errorLora = error.response.response.lorawan_device;
            if (errorLora) {
              const deviceIndex = values.eui.findIndex(
                (device) => device.id === id,
              );
              if (deviceIndex !== -1) {
                Object.keys(errorLora).forEach((key) => {
                  form.setError(
                    `eui.${deviceIndex}.${key as keyof EUIDevice['eui'][number]}`,
                    {
                      message: errorLora[key][0],
                    },
                  );
                });
              }
            }
          },
        },
      );
      await mutate();
      onEditDevice(id);
    },
    [getDirtyValuesAtIndex, onEditDevice, mutate],
  );

  useEffect(() => {
    reset({
      eui: devices.map((device) => ({
        ...device,
        network_server: device.network_server.id,
        dev_eui: formatValueEUI(device.dev_eui),
        join_eui: formatValueEUI(device.join_eui),
      })),
    });
  }, [reset, devices]);

  return (
    <>
      <DialogDeleteDevice
        onRemove={() => onRemoveRow(selectedDeleteDeviceIndex)}
        isDeleting={isDeleting}
        isOpen={isOpenDeleteDevice}
        setIsOpen={setIsOpenDeleteDevice}
        setSelectedDeleteDeviceIndex={setSelectedDeleteDeviceIndex}
      />
      <DialogSaveDevice
        isOpen={isOpenSaveDevice}
        setIsOpen={setIsOpenSaveDevice}
        onSave={onSaveDevice}
        isLoading={isUpdating}
        selectedEditDeviceId={selectedEditDeviceId}
        setSelectedEditDeviceId={setSelectedEditDeviceId}
      />
      <Form {...form}>
        <div className='overflow-hidden rounded-lg border border-brand-stroke-dark-soft bg-brand-background-fill-outermost'>
          <Table viewPortClassName='max-w-full'>
            <TableHeader className='bg-brand-fill-dark-soft'>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className='h-8 text-brand-component-text-gray text-xs font-semibold'
                        style={{ minWidth: header.column.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='align-top p-2 py-1.5'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    {t('no_devices')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className='flex items-center justify-between border-t p-2'>
            <Button
              variant='outline'
              className='gap-2 border-brand-component-stroke-dark-soft bg-transparent text-sm font-semibold text-brand-component-text-dark'
              onClick={onPrevPage}
              disabled={isDisabledPrevPage}
            >
              <ArrowLeft size={20} />
              Previous
            </Button>
            <div className='text-sm font-semibold text-brand-component-text-gray'>
              Page {pageIndex + 1}/
              {Math.max(count ? Math.ceil(count / 10) : 1, 1)}
            </div>
            <Button
              variant='outline'
              className='gap-2 border-brand-component-stroke-dark-soft bg-transparent text-sm font-semibold text-brand-component-text-dark'
              onClick={onNextPage}
              disabled={isDisabledNextPage}
            >
              Next
              <ArrowRight size={20} />
            </Button>
          </div>
        </div>
      </Form>
    </>
  );
};

export default TableDevice;
