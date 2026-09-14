import {
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';
import React, { memo, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { CloudArrowUp, Info } from '@/components/icons';
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
import { useApiDeviceColumn } from '@/containers/devices/components/add-device-modal/components/add-api-device/utils';
import { ApiDevice } from '@/containers/devices/components/add-device-modal/validator';

const DEFAULT_API_DEVICE = {
  device_model: '',
  serial_number: '',
  claim_code: '',
  is_published: false,
};

const AddApiDevice = () => {
  const t = useTranslations('organization');
  const form = useFormContext<ApiDevice>();
  const fileRef = useRef<HTMLInputElement>(null);
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    name: 'api_devices',
    control,
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const columns = useApiDeviceColumn({ t, remove, control, fields });

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const handleAddRow = () => {
    append(DEFAULT_API_DEVICE);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data as Record<string, string>[];
          append(
            data.map((row) => ({
              ...DEFAULT_API_DEVICE,
              device_model: row.device_model ?? '',
              serial_number: row.serial_number ?? '',
              claim_code: row.claim_code ?? '',
              is_published: row.is_published?.trim().toLowerCase() === 'true',
            })),
          );
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
      <div className='space-y-3'>
        <div className='flex justify-between bg-brand-component-fill-dark-soft p-2 rounded-xl'>
          <div className='flex items-center space-x-2'>
            <Info className='size-5' />
            <p className='text-brand-component-text-gray text-xs font-normal'>
              {t('import_csv')}{' '}
              <a
                href='/add-api-devices.csv'
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
            <CloudArrowUp /> <p>{t('import_CSV_button')}</p>
          </Button>
        </div>
        <Form {...form}>
          <div className='overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft'>
            <Table
              viewPortClassName='max-h-56'
              contentMinWidth={table.getTotalSize()}
            >
              <TableHeader className='bg-brand-fill-dark-soft sticky top-0 z-10'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ minWidth: header.column.getSize() }}
                        className='h-8 px-2'
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
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
                    onClick={handleAddRow}
                    prefixCpn={<Plus size={15} />}
                  >
                    {t('add_row')}
                  </Button>
                </TableCell>
              </TableRow>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
};

export default memo(AddApiDevice);
