import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';
import React, { memo, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { CloudArrowUp, Info } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import BulkSelectionToolbar from '@/containers/devices/components/add-device-modal/components/add-eui/bulk-selection-toolbar';
import { useDeviceModelColumn } from '@/containers/devices/components/add-device-modal/components/add-eui/utils';
import NetworkServers from '@/containers/devices/components/add-device-modal/components/select-network-server/components/network-servers';
import { useNetworkServer } from '@/containers/devices/components/add-device-modal/components/select-network-server/hooks/useNetworkServer';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';
import { IntegrateNetworkServer } from '@/containers/devices/components/integrate-network-server';

import { formatValueEUI } from '@/utils';

import { TableDevice } from '@/types';

import NodataSVG from '/public/images/nodata.svg';

type DeviceNoId = Omit<TableDevice, 'id'>;

const DEFAULT_DEVICE = {
  device_model: '',
  dev_eui: '',
  join_eui: '',
  claim_code: '',
  app_key: '',
};

const AddEUI = () => {
  const t = useTranslations('organization');
  const form = useFormContext<EUIDevice>();
  const fileRef = useRef<HTMLInputElement>(null);
  const { control } = form;
  const { data: networkResults, isLoading } = useNetworkServer('', 1);
  const networkServers = networkResults?.results || [];
  const { fields, append, remove } = useFieldArray({
    name: 'eui',
    control,
  });

  const networkServer = useAddDeviceModalStore((state) => state.networkServer);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useDeviceModelColumn({
    t,
    remove,
    control,
    fields,
  });

  const handleAddDevice = () => {
    append(DEFAULT_DEVICE);
  };

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const hasSelection = table.getFilteredSelectedRowModel().rows.length > 0;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data as DeviceNoId[];
          const response = data.map((row) => ({
            ...DEFAULT_DEVICE,
            ...row,
            dev_eui: formatValueEUI(row.dev_eui),
            join_eui: formatValueEUI(row.join_eui),
          }));
          append(response);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type='file'
        ref={fileRef}
        accept='.csv'
        className='hidden'
        onChange={handleFileChange}
      />
      <div className='space-y-6'>
        <div className='space-y-3'>
          <div className='flex justify-between bg-brand-component-fill-dark-soft p-2 rounded-xl'>
            <div className='flex items-center space-x-2'>
              <Info className='size-5' />
              <p className='text-brand-component-text-gray text-xs font-normal'>
                {t('import_csv')}{' '}
                <a
                  href='/add-devices.csv'
                  className='text-brand-component-text-dark cursor-pointer font-semibold'
                >
                  {t('csv_template')}
                </a>{' '}
                {t('get_started')}
              </p>
            </div>
            <Button
              onClick={() => fileRef.current?.click()}
              className='flex space-x-2'
            >
              <p>{t('import_CSV_button')}</p> <CloudArrowUp />
            </Button>
          </div>
          <Form {...form}>
            <div className='overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft'>
              <Table
                viewPortClassName='max-h-56'
                beforeTable={
                  hasSelection ? (
                    <BulkSelectionToolbar
                      table={table}
                      form={form}
                      remove={remove}
                      onClearSelection={() => setRowSelection({})}
                    />
                  ) : undefined
                }
                contentMinWidth={table.getTotalSize()}
              >
                {!hasSelection && (
                  <TableHeader className='bg-brand-fill-dark-soft sticky top-0 z-10'>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead
                              key={header.id}
                              style={{
                                minWidth: header.column.getSize(),
                              }}
                              className='h-8 px-2'
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
                )}
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        className='w-full'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                            className='align-top p-2'
                          >
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
                        className='h-16 text-center'
                      >
                        {t('empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className='sticky bottom-0 z-10 w-full border-t border-brand-component-stroke-dark-soft'>
                <TableRow>
                  <TableCell
                    className='h-16 bg-brand-component-fill-light p-0 px-4'
                    colSpan={columns.length}
                  >
                    <Button
                      variant='outline'
                      onClick={handleAddDevice}
                      prefixCpn={<Plus size={15} />}
                    >
                      {t('add')}
                    </Button>
                  </TableCell>
                </TableRow>
              </div>
            </div>
          </Form>
        </div>
        <Separator />
        <div className='space-y-4'>
          <span className='text-brand-component-text-dark text-[16px] font-semibold leading-6'>
            {t('select_network')}
          </span>
          {networkServers.length || isLoading ? (
            <div className='grid grid-cols-6 gap-2'>
              <NetworkServers
                networkServers={networkServers}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className='h-32 w-full flex items-center justify-center'>
              <div className='flex flex-col space-y-2'>
                <Image
                  src={NodataSVG}
                  alt='nodata'
                  className='h-full w-full max-w-44 object-contain flex justify-center items-center'
                />
                <p className='mt-3 text-wrap text-center text-base font-normal text-brand-component-text-dark'>
                  No results found
                </p>
              </div>
            </div>
          )}

          {networkServer && (
            <IntegrateNetworkServer networkServerName={networkServer.name} />
          )}
        </div>
        <Separator />
      </div>
    </>
  );
};

export default memo(AddEUI);
