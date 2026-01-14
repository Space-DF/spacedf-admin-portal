import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Copy, CopyCheck, Plus } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';
import React, { memo, useMemo, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { CloudArrowUp, Info } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getEUIColumns } from '@/containers/devices/components/add-device-modal/components/add-eui/utils';
import NetworkServers from '@/containers/devices/components/add-device-modal/components/select-network-server/components/network-servers';
import { useNetworkServer } from '@/containers/devices/components/add-device-modal/components/select-network-server/hooks/useNetworkServer';
import { useAddDeviceModalStore } from '@/containers/devices/components/add-device-modal/store';
import { EUIDevice } from '@/containers/devices/components/add-device-modal/validator';

import { NEXT_PUBLIC_DASHBOARD_SPACEDF_DOMAIN } from '@/shared/env';
import { formatValueEUI } from '@/utils';

import { TableDevice } from '@/types';

import NodataSVG from '/public/images/nodata.svg';

type DeviceNoId = Omit<TableDevice, 'id'>;

const DEFAULT_DEVICE = {
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

  const { slugName } = useParams();

  const [isCopied, setIsCopied] = useState(false);

  const networkServer = useAddDeviceModalStore((state) => state.networkServer);

  const lorawanUrl = `https://${slugName}.api.${NEXT_PUBLIC_DASHBOARD_SPACEDF_DOMAIN}/lorawan/${networkServer?.name.toLowerCase()}/http`;

  const handleCopy = () => {
    setIsCopied(true);
    navigator.clipboard.writeText(lorawanUrl);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const columns = useMemo(
    () => getEUIColumns({ t, remove, control, fields }),
    [t, remove, control, fields],
  );

  const handleAddDevice = () => {
    append(DEFAULT_DEVICE);
  };

  const table = useReactTable({
    data: fields,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // Use React Hook Form's generated field ID
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const data = result.data as DeviceNoId[];
          const response = data.map((row) => ({
            ...row,
            dev_eui: formatValueEUI(row.dev_eui),
            join_eui: formatValueEUI(row.join_eui),
          }));
          append(response);
          form.trigger('eui');
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
          <div className='flex justify-between'>
            <div className='flex items-center space-x-2'>
              <Info className='size-5' />
              <p className='text-brand-component-text-gray text-xs font-normal'>
                {t('import_csv')}{' '}
                <a
                  href='/add-devices.csv'
                  className='text-brand-component-text-dark cursor-pointer'
                >
                  {t('csv_template')}
                </a>{' '}
                {t('get_started')}
              </p>
            </div>
            <Button
              onClick={() => fileRef.current?.click()}
              className='flex space-x-2 h-11'
            >
              <p>{t('import_CSV_button')}</p> <CloudArrowUp />
            </Button>
          </div>
          <Form {...form}>
            <div className='overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft'>
              <Table viewPortClassName='max-h-56'>
                <TableHeader className='bg-brand-fill-dark-soft sticky top-0 z-10'>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            style={{ minWidth: header.column.getSize() }}
                            className='h-8'
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
                      className='text-brand-component-text-gray h-12'
                      onClick={handleAddDevice}
                    >
                      <Plus size={15} /> {t('add')}
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
            <div className='grid grid-cols-3 gap-2'>
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
            <div className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <span className='text-brand-component-text-dark text-[16px] font-semibold leading-6'>
                  {t('integrate')} {networkServer.name}{' '}
                </span>
                <QuestionMarkCircledIcon className='size-4 text-brand-icon-gray' />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center space-x-1.5 h-12'>
                  <Input disabled value={lorawanUrl} className='h-full' />
                  <Button
                    className='space-x-2 flex items-center h-full'
                    onClick={handleCopy}
                    disabled={isCopied}
                  >
                    <span>{t(isCopied ? 'copied' : 'copy')}</span>
                    {isCopied ? <CopyCheck size={20} /> : <Copy size={20} />}
                  </Button>
                </div>
                <div className='flex space-x-2 items-center text-base leading-5'>
                  <span className='text-brand-component-text-gray font-medium'>
                    {t('configure_lorawan_network_server')}
                  </span>
                  <span className='text-brand-component-text-dark-hover font-semibold'>
                    {t('check_our_guideline')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <Separator />
      </div>
    </>
  );
};

export default memo(AddEUI);
